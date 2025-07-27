import React from 'react';

// Print styles component
const PrintStyles = () => (
  <style>{`
    @media print {
      @page {
        margin: 0.5in;
        size: A4;
      }
      
      body * {
        visibility: hidden;
      }
      
      .bill-template, .bill-template * {
        visibility: visible;
      }
      
      .bill-template {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 20px !important;
        background: white !important;
        color: black !important;
        font-size: 12px !important;
        box-shadow: none !important;
      }
      
      .bg-gradient-to-r {
        background: #fef9c3 !important;
      }
      
      .text-white {
        color: black !important;
      }
      
      .bg-yellow-600 {
        background: #d97706 !important;
      }
    }
  `}</style>
);

interface BillTemplateProps {
  bill: {
    id: string;
    tenant_name: string;
    room_number: string;
    billing_month: string;
    rent_amount: number;
    electricity_units: number;
    electricity_rate: number;
    electricity_amount: number;
    other_charges: number;
    adjustments: number;
    total_amount: number;
    due_date: string;
    created_date: string;
  };
  serialNumber?: string;
  receiptNumber?: string;
  joiningReading?: number;
  currentReading?: number;
}

const BillTemplate: React.FC<BillTemplateProps> = ({ 
  bill, 
  serialNumber = '1001',
  receiptNumber = 'M:1001',
  joiningReading,
  currentReading
}) => {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  // Get today's date for generated date
  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });

  // Calculate electricity consumption details
  const currentMonthReading = currentReading || bill.electricity_units || '-';
  const lastMonthReading = joiningReading || '-';
  const consumption = currentReading && joiningReading ? currentReading - joiningReading : bill.electricity_units || '-';
  
  return (
    <div className="bill-template bg-white text-black p-8 max-w-2xl mx-auto border-2 border-gray-400 font-mono">
      <PrintStyles />
      {/* Header */}
      <div className="border-2 border-black mb-4">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-100 to-yellow-200">
          <div className="flex items-center gap-4">
            {/* Logo placeholder - removed SS */}
            <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">🏠</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">SHIV SHIVA RESIDENCY</h1>
              <p className="text-sm text-gray-700">Plot No. 373, Sec -70, Basal, Noida - 201301</p>
            </div>
          </div>
          <div className="text-right">
            <div className="border border-black px-3 py-1 mb-2">
              <span className="font-bold">{serialNumber}</span>
            </div>
            <div className="text-sm">
              <div>Sr. No. <span className="font-bold">{serialNumber}</span></div>
              <div>Generated on: <span className="font-bold">{today}</span></div>
            </div>

          </div>
        </div>
        
        <div className="p-2 bg-yellow-50 text-center font-bold text-lg border-t-2 border-black">
          PAYMENT RECEIPT
        </div>
      </div>

      {/* Tenant Details Table */}
      <div className="border-2 border-black mb-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-left font-bold">Room No.</th>
              <th className="border border-black p-2 text-left font-bold">Customer Name</th>
              <th className="border border-black p-2 text-left font-bold">Monthly Rent</th>
              <th className="border border-black p-2 text-left font-bold">Deposit</th>
              <th className="border border-black p-2 text-left font-bold">Balance</th>
              <th className="border border-black p-2 text-left font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-3 text-center font-bold text-lg">{bill.room_number}</td>
              <td className="border border-black p-3 font-bold text-lg">{bill.tenant_name}</td>
              <td className="border border-black p-3 text-center font-bold">{formatCurrency(bill.rent_amount)}</td>
              <td className="border border-black p-3 text-center font-bold">-</td>
              <td className="border border-black p-3 text-center font-bold">-</td>
              <td className="border border-black p-3 text-center font-bold text-lg">{formatCurrency(bill.rent_amount)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Electricity Bill Section */}
      <div className="border-2 border-black mb-4">
        <div className="bg-gray-100 p-2 border-b-2 border-black">
          <h3 className="font-bold text-lg">Electricity Bill</h3>
        </div>
        
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="border border-black p-3 font-bold bg-gray-50">Joining Reading</td>
              <td className="border border-black p-3 text-center font-bold">{lastMonthReading}</td>
              <td className="border border-black p-3"></td>
            </tr>
            <tr>
              <td className="border border-black p-3 font-bold bg-gray-50">Current Reading</td>
              <td className="border border-black p-3 text-center font-bold">{currentMonthReading}</td>
              <td className="border border-black p-3"></td>
            </tr>
            <tr>
              <td className="border border-black p-3 font-bold bg-gray-50">Total Consume Unit</td>
              <td className="border border-black p-3 text-center font-bold">{consumption}</td>
              <td className="border border-black p-3 text-center font-bold">@ ₹{bill.electricity_rate || 12}/unit</td>
            </tr>
            <tr>
              <td className="border border-black p-3 font-bold bg-gray-50">Total Unit Amount</td>
              <td className="border border-black p-3 text-center font-bold">{formatCurrency(bill.electricity_amount || 0)}</td>
              <td className="border border-black p-3"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Grand Total */}
      <div className="border-2 border-black mb-4">
        <div className="flex justify-between items-center p-4 bg-yellow-100">
          <span className="text-xl font-bold">Grand Total</span>
          <span className="text-2xl font-bold">{formatCurrency((bill.rent_amount || 0) + (bill.electricity_amount || 0))}</span>
        </div>
      </div>

      {/* Payment Notice */}
      <div className="border-2 border-black mb-6 p-4 bg-gray-50">
        <p className="text-sm text-center">
          <span className="font-bold">Please clear all your dues till your rent date of every month 
          otherwise there will be penalty of 100rs on daily basis.</span>
        </p>
      </div>

      {/* Signatures */}
      <div className="flex justify-between items-end">
        <div className="text-center">
          <div className="border-b border-black w-40 mb-2"></div>
          <p className="font-bold">Customer Signature</p>
        </div>
        <div className="text-center">
          <div className="border-b border-black w-40 mb-2"></div>
          <p className="font-bold">Auth. Signature</p>
        </div>
      </div>

      {/* Bill Details Footer - Removed all dates */}
      <div className="mt-6 text-xs text-gray-600 text-center">
        <p>Generated on: {today}</p>
      </div>
    </div>
  );
};

export default BillTemplate; 