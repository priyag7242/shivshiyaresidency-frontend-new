import React, { useState } from 'react';
import { 
  MessageCircle, 
  Clock, 
  AlertCircle, 
  Settings, 
  Search, 
  Phone,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PaymentReminder {
  id: string;
  tenant_id: string;
  tenant_name: string;
  room_number: string;
  mobile: string;
  due_date: string;
  amount_due: number;
  days_overdue: number;
  status: 'pending' | 'sent' | 'paid';
  last_reminder_sent?: string;
  reminder_count: number;
  bill_id?: string;
}

interface AutoReminderSettings {
  enabled: boolean;
  reminder_days: number[];
  overdue_reminder_interval: number;
  max_reminders: number;
  auto_update_status: boolean;
}

interface AutoReminderSystemProps {
  onRefresh: () => void;
}

const AutoReminderSystem: React.FC<AutoReminderSystemProps> = ({ onRefresh }) => {
  const [reminders, setReminders] = useState<PaymentReminder[]>([]);
  const [reminderSettings, setReminderSettings] = useState<AutoReminderSettings>({
    enabled: true,
    reminder_days: [3, 1],
    overdue_reminder_interval: 2,
    max_reminders: 5,
    auto_update_status: true
  });
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [processingReminders, setProcessingReminders] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const checkPaymentDueDates = async () => {
    try {
      console.log('🔍 Checking payment due dates...');
      
      const { data: bills, error } = await supabase
        .from('payments')
        .select('*')
        .in('status', ['pending', 'overdue']);
      
      if (error) throw error;
      
      const today = new Date();
      const reminders: PaymentReminder[] = [];
      
      bills?.forEach(bill => {
        const dueDate = new Date(bill.due_date);
        const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        const shouldSendReminder = 
          (daysDiff <= 0 && bill.status === 'pending') ||
          (daysDiff > 0 && daysDiff <= Math.max(...reminderSettings.reminder_days)) ||
          (daysDiff <= 0 && bill.status === 'overdue' && 
           (!bill.last_reminder_sent || 
            Math.ceil((today.getTime() - new Date(bill.last_reminder_sent).getTime()) / (1000 * 60 * 60 * 24)) >= reminderSettings.overdue_reminder_interval));
        
        if (shouldSendReminder) {
          reminders.push({
            id: bill.id,
            tenant_id: bill.tenant_id,
            tenant_name: bill.tenant_name,
            room_number: bill.room_number,
            mobile: '',
            due_date: bill.due_date,
            amount_due: bill.balance_due || bill.total_amount,
            days_overdue: daysDiff <= 0 ? Math.abs(daysDiff) : 0,
            status: 'pending',
            reminder_count: bill.reminder_count || 0,
            bill_id: bill.id
          });
        }
      });
      
      const tenantIds = [...new Set(reminders.map(r => r.tenant_id))];
      const { data: tenants, error: tenantError } = await supabase
        .from('tenants')
        .select('id, mobile')
        .in('id', tenantIds);
      
      if (tenantError) throw tenantError;
      
      const remindersWithMobile = reminders.map(reminder => {
        const tenant = tenants?.find(t => t.id === reminder.tenant_id);
        return {
          ...reminder,
          mobile: tenant?.mobile || ''
        };
      });
      
      setReminders(remindersWithMobile);
      console.log(`📱 Found ${remindersWithMobile.length} reminders to send`);
      
      return remindersWithMobile;
    } catch (error) {
      console.error('❌ Error checking payment due dates:', error);
      return [];
    }
  };

  const sendAutomaticReminders = async () => {
    try {
      setProcessingReminders(true);
      console.log('📤 Sending automatic reminders...');
      
      const remindersToSend = await checkPaymentDueDates();
      
      if (remindersToSend.length === 0) {
        alert('No reminders to send at this time.');
        return;
      }
      
      let sentCount = 0;
      let updatedCount = 0;
      
      for (const reminder of remindersToSend) {
        try {
          const message = generateReminderMessage(reminder);
          
          const { error: updateError } = await supabase
            .from('payments')
            .update({
              last_reminder_sent: new Date().toISOString(),
              reminder_count: (reminder.reminder_count || 0) + 1,
              status: reminder.days_overdue > 0 ? 'overdue' : 'pending'
            })
            .eq('id', reminder.bill_id);
          
          if (updateError) throw updateError;
          
          if (reminder.days_overdue > 0 && reminderSettings.auto_update_status) {
            const { error: statusError } = await supabase
              .from('payments')
              .update({ status: 'overdue' })
              .eq('id', reminder.bill_id);
            
            if (statusError) throw statusError;
            updatedCount++;
          }
          
          sentCount++;
          console.log(`✅ Sent reminder to ${reminder.tenant_name} (${reminder.mobile})`);
          
        } catch (error) {
          console.error(`❌ Failed to send reminder to ${reminder.tenant_name}:`, error);
        }
      }
      
      alert(`📱 Sent ${sentCount} reminders\n📊 Updated ${updatedCount} overdue statuses`);
      
      onRefresh();
      
    } catch (error) {
      console.error('❌ Error sending automatic reminders:', error);
      alert('Failed to send automatic reminders');
    } finally {
      setProcessingReminders(false);
    }
  };

  const generateReminderMessage = (reminder: PaymentReminder) => {
    const today = new Date();
    const dueDate = new Date(reminder.due_date);
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let message = `🏠 *Shiv Shiva Residency - Payment Reminder*\n\n`;
    message += `Dear ${reminder.tenant_name},\n\n`;
    
    if (daysDiff > 0) {
      message += `Your rent payment of *₹${formatCurrency(reminder.amount_due)}* for Room ${reminder.room_number} is due in *${daysDiff} day${daysDiff > 1 ? 's' : ''}*.\n\n`;
      message += `📅 Due Date: ${dueDate.toLocaleDateString('en-IN')}\n`;
      message += `💰 Amount Due: ₹${formatCurrency(reminder.amount_due)}\n\n`;
      message += `Please ensure timely payment to avoid any late fees.\n\n`;
    } else {
      message += `Your rent payment of *₹${formatCurrency(reminder.amount_due)}* for Room ${reminder.room_number} is *OVERDUE* by *${Math.abs(daysDiff)} day${Math.abs(daysDiff) > 1 ? 's' : ''}*.\n\n`;
      message += `📅 Due Date: ${dueDate.toLocaleDateString('en-IN')}\n`;
      message += `💰 Amount Due: ₹${formatCurrency(reminder.amount_due)}\n`;
      message += `⚠️ Late Fee: ₹${formatCurrency(Math.round(reminder.amount_due * 0.05))} (5%)\n\n`;
      message += `Please make the payment immediately to avoid further penalties.\n\n`;
    }
    
    message += `For any queries, please contact us.\n\n`;
    message += `Thank you,\nShiv Shiva Residency Team`;
    
    return message;
  };

  const openWhatsAppReminder = (reminder: PaymentReminder) => {
    const message = generateReminderMessage(reminder);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/91${reminder.mobile}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* Auto Reminder System */}
      <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-golden-400 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Automatic Payment Reminder System
          </h3>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${reminderSettings.enabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-golden-300">
              {reminderSettings.enabled ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-dark-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-golden-300">Reminder Schedule</span>
            </div>
            <p className="text-xs text-golden-400">
              Send reminders {reminderSettings.reminder_days.join(', ')} days before due date
            </p>
          </div>

          <div className="bg-dark-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-golden-300">Overdue Reminders</span>
            </div>
            <p className="text-xs text-golden-400">
              Send overdue reminders every {reminderSettings.overdue_reminder_interval} days
            </p>
          </div>

          <div className="bg-dark-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-golden-300">Auto Status Update</span>
            </div>
            <p className="text-xs text-golden-400">
              {reminderSettings.auto_update_status ? 'Enabled' : 'Disabled'} - Auto update overdue status
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={checkPaymentDueDates}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Search className="h-4 w-4" />
            Check Due Dates
          </button>
          <button
            onClick={sendAutomaticReminders}
            disabled={processingReminders}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {processingReminders ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Sending Reminders...
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4" />
                Send All Reminders
              </>
            )}
          </button>
        </div>
      </div>

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-golden-400">Payment Reminders</h3>
              <button
                onClick={() => setShowReminderModal(false)}
                className="text-golden-400 hover:text-golden-300"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {reminders.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-golden-400/50 mx-auto mb-4" />
                <p className="text-golden-300">No reminders to send at this time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="bg-dark-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-golden-100 font-medium">{reminder.tenant_name}</h4>
                        <p className="text-golden-300 text-sm">Room {reminder.room_number}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-orange-400">
                          {formatCurrency(reminder.amount_due)}
                        </p>
                        <p className="text-sm text-golden-300">
                          {reminder.days_overdue > 0 ? `${reminder.days_overdue} days overdue` : 'Due soon'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-golden-400">
                        <p>Due: {new Date(reminder.due_date).toLocaleDateString('en-IN')}</p>
                        <p>Mobile: {reminder.mobile || 'Not available'}</p>
                      </div>
                      <button
                        onClick={() => openWhatsAppReminder(reminder)}
                        disabled={!reminder.mobile}
                        className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <Phone className="h-3 w-3" />
                        Send WhatsApp
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AutoReminderSystem; 