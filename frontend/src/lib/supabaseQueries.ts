import { supabase } from './supabase';

// Dashboard queries
export const dashboardQueries = {
  async getOverview() {
    const { data: tenants } = await supabase
      .from('tenants')
      .select('*')
      .eq('is_active', true);

    const { data: rooms } = await supabase
      .from('rooms')
      .select('*');

    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('billing_month', new Date().toISOString().slice(0, 7));

    const occupied = rooms?.filter(r => r.status === 'occupied').length || 0;
    const total = rooms?.length || 0;

    return {
      total_tenants: tenants?.length || 0,
      active_tenants: tenants?.length || 0,
      new_tenants_this_month: 0,
      total_rooms: total,
      occupied_rooms: occupied,
      available_rooms: rooms?.filter(r => r.status === 'vacant').length || 0,
      maintenance_rooms: rooms?.filter(r => r.status === 'maintenance').length || 0,
      occupancy_rate: total > 0 ? Math.round((occupied / total) * 100) : 0,
      total_revenue_potential: rooms?.reduce((sum, r) => sum + Number(r.monthly_rent), 0) || 0,
      actual_revenue_this_month: payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0) || 0,
      pending_collections: payments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0) || 0,
      collection_rate: 0,
      recent_payments: payments || [],
      maintenance_alerts: 0,
      monthly_revenue_trend: [],
      occupancy_trend: [],
      payment_method_distribution: {},
      current_month_stats: {
        month: new Date().toISOString().slice(0, 7),
        total_bills: payments?.length || 0,
        paid_bills: payments?.filter(p => p.status === 'paid').length || 0,
        pending_bills: payments?.filter(p => p.status === 'pending').length || 0,
        collection_amount: payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0) || 0,
        pending_amount: payments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0) || 0
      }
    };
  },

  async getRecentActivities() {
    const { data: payments } = await supabase
      .from('payments')
      .select('*, tenants(name)')
      .order('created_at', { ascending: false })
      .limit(5);

    return payments?.map(p => ({
      id: p.id,
      type: 'payment',
      title: `Payment from ${p.tenants?.name || 'Unknown'}`,
      description: `₹${p.amount} received`,
      date: p.payment_date,
      amount: p.amount,
      icon: 'payment',
      color: 'green'
    })) || [];
  },

  async getAlerts() {
    const { data: pendingPayments } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'pending');

    const { data: maintenanceIssues } = await supabase
      .from('maintenance')
      .select('*')
      .eq('status', 'pending');

    const alerts = [];
    
    if (pendingPayments && pendingPayments.length > 0) {
      alerts.push({
        id: '1',
        type: 'payment',
        priority: 'high' as const,
        title: 'Pending Payments',
        message: `${pendingPayments.length} payments pending`,
        count: pendingPayments.length,
        action: 'View Payments',
        link: '/payments'
      });
    }

    if (maintenanceIssues && maintenanceIssues.length > 0) {
      alerts.push({
        id: '2',
        type: 'maintenance',
        priority: 'medium' as const,
        title: 'Maintenance Required',
        message: `${maintenanceIssues.length} issues pending`,
        count: maintenanceIssues.length,
        action: 'View Issues',
        link: '/maintenance'
      });
    }

    return alerts;
  }
};

// Rooms queries
export const roomsQueries = {
  async getAll() {
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .order('room_number');
    
    if (roomsError) throw roomsError;

    // Get tenants for each room with financial details
    const roomsWithTenants = await Promise.all(
      (rooms || []).map(async (room) => {
        const { data: tenants } = await supabase
          .from('tenants')
          .select('id, name, mobile, joining_date, status, monthly_rent, security_deposit')
          .eq('room_number', room.room_number)
          .eq('status', 'active');
        
        // Calculate total rent and deposit from all tenants in this room
        const totalMonthlyRent = tenants?.reduce((sum, tenant) => sum + (tenant.monthly_rent || 0), 0) || 0;
        const totalSecurityDeposit = tenants?.reduce((sum, tenant) => sum + (tenant.security_deposit || 0), 0) || 0;
        
        return {
          ...room,
          // Override room's rent and deposit with calculated totals from tenants
          monthly_rent: totalMonthlyRent,
          security_deposit: totalSecurityDeposit,
          tenants: tenants?.map(tenant => ({
            id: tenant.id,
            name: tenant.name,
            allocated_date: tenant.joining_date,
            monthly_rent: tenant.monthly_rent || 0,
            security_deposit: tenant.security_deposit || 0
          })) || []
        };
      })
    );
    
    return roomsWithTenants;
  },

  async create(room: any) {
    const { data, error } = await supabase
      .from('rooms')
      .insert([room])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

    async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

// Tenants queries
export const tenantsQueries = {
  async getAll() {
    const { data, error } = await supabase
      .from('tenants')
      .select(`
        *,
        rooms(room_number)
      `)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data?.map(t => ({
      ...t,
      room_number: t.rooms?.room_number
    }));
  },

  async create(tenant: any) {
    const { data, error } = await supabase
      .from('tenants')
      .insert([tenant])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Payments queries
export const paymentsQueries = {
  async getAll() {
    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*, tenants(name, mobile), rooms(room_number)')
        .order('payment_date', { ascending: false });
      
      if (error) {
        console.error('Payments fetch error:', error);
        return [];
      }
      
      return payments?.map(p => ({
        ...p,
        tenant_name: p.tenants?.name || 'Unknown',
        tenant_mobile: p.tenants?.mobile || '',
        room_number: p.rooms?.room_number || ''
      })) || [];
    } catch (err) {
      console.error('Payments query error:', err);
      return [];
    }
  },

  async create(payment: any) {
    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Maintenance queries
export const maintenanceQueries = {
  async getAll() {
    const { data, error } = await supabase
      .from('maintenance')
      .select(`
        *,
        rooms!inner(room_number),
        tenants(name)
      `)
      .order('reported_date', { ascending: false });
    
    if (error) throw error;
    
    return data?.map(m => ({
      ...m,
      room_number: m.rooms?.room_number || '',
      tenant_name: m.tenants?.name || 'N/A'
    })) || [];
  },

  async create(maintenance: any) {
    const { data, error } = await supabase
      .from('maintenance')
      .insert([maintenance])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('maintenance')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Visitors queries
export const visitorsQueries = {
  async getAll() {
    const { data, error } = await supabase
      .from('visitors')
      .select(`
        *,
        tenants!inner(name),
        rooms!inner(room_number)
      `)
      .order('check_in_time', { ascending: false });
    
    if (error) throw error;
    
    return data?.map(v => ({
      ...v,
      tenant_name: v.tenants?.name || '',
      room_number: v.rooms?.room_number || ''
    })) || [];
  },

  async create(visitor: any) {
    const { data, error } = await supabase
      .from('visitors')
      .insert([visitor])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async checkOut(id: string) {
    const { data, error } = await supabase
      .from('visitors')
      .update({ check_out_time: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};