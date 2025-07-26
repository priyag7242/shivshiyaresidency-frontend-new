import { supabase } from './supabase';

// Dashboard queries
export const dashboardQueries = {
  async getOverview() {
    try {
      // Get all tenants (active + inactive) for total revenue calculation
      const { data: allTenants } = await supabase
        .from('tenants')
        .select('*');

      // Get active tenants for active count
      const { data: activeTenants } = await supabase
        .from('tenants')
        .select('*')
        .eq('status', 'active');

      // Get inactive/adjusting tenants for inactive count
      const { data: inactiveTenants } = await supabase
        .from('tenants')
        .select('*')
        .in('status', ['inactive', 'adjust']);

      // Get all rooms
      const { data: rooms } = await supabase
        .from('rooms')
        .select('*');

      // Get current month payments
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('billing_month', currentMonth);

      // Calculate room statistics
      const occupied = rooms?.filter(r => r.status === 'occupied').length || 0;
      const total = rooms?.length || 0;
      const available = rooms?.filter(r => r.status === 'available').length || 0;
      const maintenance = rooms?.filter(r => r.status === 'maintenance').length || 0;

      // Calculate payment statistics
      const paidPayments = payments?.filter(p => p.status === 'paid') || [];
      const pendingPayments = payments?.filter(p => p.status === 'pending') || [];
      
      const actualRevenue = paidPayments.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);
      const pendingCollections = pendingPayments.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);
      
      // Calculate collection rate
      const totalBills = (payments?.length || 0);
      const paidBills = paidPayments.length;
      const collectionRate = totalBills > 0 ? Math.round((paidBills / totalBills) * 100) : 0;

      // Calculate total revenue potential from all tenants (active + inactive)
      const totalRevenuePotential = allTenants?.reduce((sum, t) => sum + Number(t.monthly_rent || 0), 0) || 0;

      return {
        total_tenants: allTenants?.length || 0,
        active_tenants: activeTenants?.length || 0,
        inactive_tenants: inactiveTenants?.length || 0,
        new_tenants_this_month: 0, // TODO: Calculate based on joining_date
        total_rooms: total,
        occupied_rooms: occupied,
        available_rooms: available,
        maintenance_rooms: maintenance,
        occupancy_rate: total > 0 ? Math.round((occupied / total) * 100) : 0,
        total_revenue_potential: totalRevenuePotential,
        actual_revenue_this_month: actualRevenue,
        pending_collections: pendingCollections,
        collection_rate: collectionRate,
        recent_payments: paidPayments.slice(0, 5) || [],
        maintenance_alerts: 0, // TODO: Get from maintenance table
        monthly_revenue_trend: [], // TODO: Calculate from historical data
        occupancy_trend: [], // TODO: Calculate from historical data
        payment_method_distribution: {}, // TODO: Calculate from payments
        current_month_stats: {
          month: currentMonth,
          total_bills: totalBills,
          paid_bills: paidBills,
          pending_bills: pendingPayments.length,
          collection_amount: actualRevenue,
          pending_amount: pendingCollections
        }
      };
    } catch (error) {
      console.error('Error in getOverview:', error);
      // Return default data structure
      return {
        total_tenants: 0,
        active_tenants: 0,
        new_tenants_this_month: 0,
        total_rooms: 0,
        occupied_rooms: 0,
        available_rooms: 0,
        maintenance_rooms: 0,
        occupancy_rate: 0,
        total_revenue_potential: 0,
        actual_revenue_this_month: 0,
        pending_collections: 0,
        collection_rate: 0,
        recent_payments: [],
        maintenance_alerts: 0,
        monthly_revenue_trend: [],
        occupancy_trend: [],
        payment_method_distribution: {},
        current_month_stats: {
          month: new Date().toISOString().slice(0, 7),
          total_bills: 0,
          paid_bills: 0,
          pending_bills: 0,
          collection_amount: 0,
          pending_amount: 0
        }
      };
    }
  },

  async getRecentActivities() {
    try {
      const { data: payments } = await supabase
        .from('payments')
        .select('*, tenants(name)')
        .order('created_at', { ascending: false })
        .limit(5);

      return payments?.map(p => ({
        id: p.id,
        type: 'payment',
        title: `Payment from ${p.tenants?.name || 'Unknown'}`,
        description: `₹${p.total_amount || p.amount || 0} received`,
        date: p.payment_date || p.created_at,
        amount: p.total_amount || p.amount || 0,
        icon: 'payment',
        color: 'green'
      })) || [];
    } catch (error) {
      console.error('Error in getRecentActivities:', error);
      return [];
    }
  },

  async getAlerts() {
    try {
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
    } catch (error) {
      console.error('Error in getAlerts:', error);
      return [];
    }
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
          // Update current_occupancy to match actual tenant count
          current_occupancy: tenants?.length || 0,
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
      .eq('status', 'active')
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