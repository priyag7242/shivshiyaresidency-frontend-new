import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, FileText, MessageCircle, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { uploadPDFToCloudinary } from '../lib/cloudinary';

interface BillData {
  id: string;
  tenant_name: string;
  room_number: string;
  billing_month: string;
  amount: number;
  remarks?: string;
  created_at: string;
  tenant_id: string;
  due_date?: string; // Added due_date to the interface
  electricity_units?: number; // Added electricity_units to the interface
  electricity_amount?: number; // Added electricity_amount to the interface
}

interface BillDownloadProps {
  bill: BillData;
  onClose: () => void;
}

const BillDownload: React.FC<BillDownloadProps> = ({ bill, onClose }) => {
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const calculateDueDate = (billingMonth: string) => {
    const [year, month] = billingMonth.split('-');
    const dueDate = new Date(parseInt(year), parseInt(month), 0);
    return dueDate.toLocaleDateString('en-IN');
  };

  const generatePDF = async () => {
    try {
      const billElement = document.getElementById('bill-content');
      if (!billElement) return;

      const canvas = await html2canvas(billElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `Bill_${bill.tenant_name}_Room${bill.room_number}_${bill.billing_month}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const generatePDFBlob = async (): Promise<Blob> => {
    try {
      const billElement = document.getElementById('bill-content');
      if (!billElement) throw new Error('Bill content not found');
  
      const canvas = await html2canvas(billElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
  
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
  
      let position = 0;
  
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
  
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
  
      // Convert PDF to blob
      const pdfBlob = pdf.output('blob');
      return pdfBlob;
    } catch (error) {
      console.error('Error generating PDF blob:', error);
      throw new Error('Failed to generate PDF');
    }
  };
  
  const sharePDFViaWhatsApp = async () => {
    try {
      setSendingWhatsApp(true);

      // Check if Cloudinary is configured
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
      const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

      if (!cloudName || !apiKey || !apiSecret || 
          cloudName === 'your-cloud-name' || 
          apiKey === 'your-api-key' || 
          apiSecret === 'your-api-secret') {
        alert('Cloudinary is not configured. Please set up Cloudinary environment variables for PDF sharing.\n\nTo configure:\n1. Sign up at cloudinary.com\n2. Get your cloud name, API key, and API secret\n3. Add them to your .env file:\nVITE_CLOUDINARY_CLOUD_NAME=your-cloud-name\nVITE_CLOUDINARY_API_KEY=your-api-key\nVITE_CLOUDINARY_API_SECRET=your-api-secret');
        return;
      }

      // Fetch tenant mobile number
      const { data: tenant, error } = await supabase
        .from('tenants')
        .select('mobile')
        .eq('id', bill.tenant_id)
        .single();

      if (error || !tenant?.mobile) {
        alert('Tenant mobile number not found');
        return;
      }

      // Generate PDF blob
      const pdfBlob = await generatePDFBlob();
      
      // Create filename
      const fileName = `Bill_${bill.tenant_name}_Room${bill.room_number}_${bill.billing_month}.pdf`;
      
      // Upload to Cloudinary
      const uploadResult = await uploadPDFToCloudinary(pdfBlob, fileName);
      
      // Create WhatsApp message with PDF link
      const message = `🏠 *Shiv Shiva Residency - Payment Bill*\n\nDear ${bill.tenant_name},\n\nYour rent payment bill for Room ${bill.room_number} for ${bill.billing_month} is ready.\n\n📄 *Download Bill PDF:* ${uploadResult.secure_url}\n\n💰 Amount: ${formatCurrency(bill.amount)}\n📅 Due Date: ${calculateDueDate(bill.billing_month)}\n\nPlease ensure timely payment to avoid any late fees.\n\nThank you,\nShiv Shiva Residency Team`;

      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/91${tenant.mobile}?text=${encodedMessage}`, '_blank');

      // Show success message
      alert('PDF uploaded and WhatsApp message sent successfully! The tenant can download the PDF directly from the link.');

    } catch (error) {
      console.error('Error sharing PDF via WhatsApp:', error);
      alert('Error sharing PDF. Please check your Cloudinary configuration.');
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const sendWhatsApp = async () => {
    try {
      setSendingWhatsApp(true);

      // Fetch tenant mobile number and joining date
      const { data: tenant, error } = await supabase
        .from('tenants')
        .select('mobile, joining_date')
        .eq('id', bill.tenant_id)
        .single();

      if (error || !tenant?.mobile) {
        alert('Tenant mobile number not found');
        return;
      }

      // Calculate due date based on joining date
      let dueDateStr;
      if (bill.due_date) {
        // Use stored due_date if available
        dueDateStr = new Date(bill.due_date).toLocaleDateString('en-IN');
      } else if (tenant.joining_date) {
        // Calculate based on joining date
        const joiningDate = new Date(tenant.joining_date);
        const [year, monthStr] = bill.billing_month.split('-');
        const targetMonth = parseInt(monthStr);
        const targetYear = parseInt(year);
        
        // Set due date to same day of month as joining date
        let dueDate = new Date(targetYear, targetMonth - 1, joiningDate.getDate());
        
        // Handle edge cases (e.g., 31st in February)
        if (dueDate.getMonth() !== targetMonth - 1) {
          dueDate = new Date(targetYear, targetMonth, 0); // Last day of month
        }
        
        dueDateStr = dueDate.toLocaleDateString('en-IN');
      } else {
        // Fallback: use end of month
        const [year, month] = bill.billing_month.split('-');
        const dueDate = new Date(parseInt(year), parseInt(month), 0);
        dueDateStr = dueDate.toLocaleDateString('en-IN');
      }

      // Create WhatsApp message
      const message = `🏠 *Shiv Shiva Residency - Payment Bill*\n\nDear ${bill.tenant_name},\n\nYour rent payment bill for Room ${bill.room_number} for ${bill.billing_month} is ready.\n\n📅 Due Date: ${dueDateStr}\n💰 Amount: ${formatCurrency(bill.amount)}\n\nPlease ensure timely payment to avoid any late fees.\n\nThank you,\nShiv Shiva Residency Team`;

      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/91${tenant.mobile}?text=${encodedMessage}`, '_blank');

    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      alert('Error sending WhatsApp message. Please try again.');
    } finally {
      setSendingWhatsApp(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Download Bill</h2>
          <div className="flex gap-3">
            <button
              onClick={generatePDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
            <button
              onClick={sendWhatsApp}
              disabled={sendingWhatsApp}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <MessageCircle className="h-4 w-4" />
              {sendingWhatsApp ? 'Sending...' : 'Send WhatsApp'}
            </button>
            <button
              onClick={sharePDFViaWhatsApp}
              disabled={sendingWhatsApp}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <Share2 className="h-4 w-4" />
              {sendingWhatsApp ? 'Uploading...' : 'Share PDF via WhatsApp'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Bill Content */}
        <div className="p-6">
          <div id="bill-content" className="bg-white border-2 border-gray-300 p-8 max-w-2xl mx-auto">
            {/* Header Section */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">SHIV SHIVA RESIDENCY</h1>
                  <p className="text-sm text-gray-600">Plot No. 373, Sec-70, Basai, Noida - 201301</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">M: 8929400391</p>
                <p className="text-sm text-gray-600">Date: {formatDate(bill.created_at)}</p>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-300 pb-2">PAYMENT RECEIPT</h2>
            </div>

            {/* Receipt Number */}
            <div className="flex justify-between mb-6">
              <p className="text-sm text-gray-600">Sr. No. {bill.id.slice(-4)}</p>
              <p className="text-sm text-gray-600">Due Date: {calculateDueDate(bill.billing_month)}</p>
            </div>

            {/* Payment Details Table */}
            <div className="mb-6">
              <table className="w-full border-collapse border border-gray-400">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 p-2 text-left">Room No.</th>
                    <th className="border border-gray-400 p-2 text-left">Customer Name</th>
                    <th className="border border-gray-400 p-2 text-left">Monthly Rent</th>
                    <th className="border border-gray-400 p-2 text-left">Deposit</th>
                    <th className="border border-gray-400 p-2 text-left">Balance</th>
                    <th className="border border-gray-400 p-2 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-2">{bill.room_number}</td>
                    <td className="border border-gray-400 p-2">{bill.tenant_name}</td>
                    <td className="border border-gray-400 p-2">{formatCurrency(bill.amount)}</td>
                    <td className="border border-gray-400 p-2">-</td>
                    <td className="border border-gray-400 p-2">-</td>
                    <td className="border border-gray-400 p-2 font-bold">{formatCurrency(bill.amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Electricity Bill Section */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-2">Electricity Bill</h3>
              <table className="w-full border-collapse border border-gray-400">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 p-2 text-left">Current Month Unit</th>
                    <th className="border border-gray-400 p-2 text-left">Last Month Unit</th>
                    <th className="border border-gray-400 p-2 text-left">Total Consume Unit</th>
                    <th className="border border-gray-400 p-2 text-left">Total Unit Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-2">{bill.electricity_units ?? '-'}</td>
                    <td className="border border-gray-400 p-2">-</td>
                    <td className="border border-gray-400 p-2">{bill.electricity_units ?? '-'}</td>
                    <td className="border border-gray-400 p-2">{bill.electricity_units ? bill.electricity_units * 12 : '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Grand Total */}
            <div className="flex justify-end mb-6">
              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">Grand Total: {formatCurrency(bill.amount)}</p>
              </div>
            </div>

            {/* Important Note */}
            <div className="border-2 border-gray-300 p-4 mb-6 bg-yellow-50">
              <p className="text-sm text-gray-700 font-medium">
                Please clear all your dues till your rent date of every month otherwise there will be penalty of 100rs on daily basis.
              </p>
            </div>

            {/* Signature Section */}
            <div className="flex justify-between">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Customer Signature</p>
                <div className="border-b-2 border-gray-400 w-32 h-8"></div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Auth. Signature</p>
                <div className="border-b-2 border-gray-400 w-32 h-8"></div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-600">
              <p>Generated on: {formatDate(new Date().toISOString())}</p>
              <p>Bill Month: {bill.billing_month}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillDownload; 