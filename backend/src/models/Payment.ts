import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  tenantId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  amount: number;
  type: 'rent' | 'security_deposit' | 'maintenance' | 'electricity' | 'water' | 'other';
  description?: string;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paymentMethod?: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'cheque';
  transactionId?: string;
  receipt?: string;
  month: string; // Format: YYYY-MM
  year: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required']
  },
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  type: {
    type: String,
    enum: ['rent', 'security_deposit', 'maintenance', 'electricity', 'water', 'other'],
    required: [true, 'Payment type is required']
  },
  description: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  paidDate: Date,
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'partial'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bank_transfer', 'cheque']
  },
  transactionId: {
    type: String,
    trim: true
  },
  receipt: String,
  month: {
    type: String,
    required: [true, 'Month is required'],
    match: /^\d{4}-\d{2}$/
  },
  year: {
    type: Number,
    required: [true, 'Year is required']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  }
}, {
  timestamps: true
});

PaymentSchema.index({ tenantId: 1 });
PaymentSchema.index({ roomId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ dueDate: 1 });
PaymentSchema.index({ month: 1 });
PaymentSchema.index({ year: 1 });

// Update status based on due date
PaymentSchema.pre('save', function(this: IPayment, next: () => void) {
  if (this.status === 'pending' && this.dueDate < new Date()) {
    this.status = 'overdue';
  }
  next();
});

export default mongoose.model<IPayment>('Payment', PaymentSchema); 