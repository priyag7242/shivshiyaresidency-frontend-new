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
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        tenants!inner(
          id,
          name,
          mobile
        )
      `)
      .order('room_number');
    
    if (error) throw error;
    return data;
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