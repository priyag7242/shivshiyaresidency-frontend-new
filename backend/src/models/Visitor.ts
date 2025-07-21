import mongoose, { Document, Schema } from 'mongoose';

export interface IVisitor extends Document {
  tenantId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  purpose: string;
  checkInTime: Date;
  checkOutTime?: Date;
  idProof?: {
    type: string;
    number: string;
  };
  photo?: string;
  status: 'checked_in' | 'checked_out';
  approvedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VisitorSchema: Schema = new Schema({
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
  name: {
    type: String,
    required: [true, 'Visitor name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  purpose: {
    type: String,
    required: [true, 'Purpose of visit is required'],
    trim: true
  },
  checkInTime: {
    type: Date,
    required: [true, 'Check-in time is required'],
    default: Date.now
  },
  checkOutTime: Date,
  idProof: {
    type: {
      type: String,
      enum: ['aadhar', 'pan', 'driving_license', 'passport', 'voter_id']
    },
    number: String
  },
  photo: String,
  status: {
    type: String,
    enum: ['checked_in', 'checked_out'],
    default: 'checked_in'
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Approved by is required']
  }
}, {
  timestamps: true
});

VisitorSchema.index({ tenantId: 1 });
VisitorSchema.index({ roomId: 1 });
VisitorSchema.index({ status: 1 });
VisitorSchema.index({ checkInTime: 1 });

export default mongoose.model<IVisitor>('Visitor', VisitorSchema); 