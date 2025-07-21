import mongoose, { Document, Schema } from 'mongoose';

export interface IMaintenanceRequest extends Document {
  tenantId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'cleaning' | 'repair' | 'appliance' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  images?: string[];
  assignedTo?: mongoose.Types.ObjectId;
  completedDate?: Date;
  cost?: number;
  feedback?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceRequestSchema: Schema = new Schema({
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
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['plumbing', 'electrical', 'cleaning', 'repair', 'appliance', 'other'],
    required: [true, 'Category is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  images: [{
    type: String
  }],
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  completedDate: Date,
  cost: {
    type: Number,
    min: 0
  },
  feedback: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

MaintenanceRequestSchema.index({ tenantId: 1 });
MaintenanceRequestSchema.index({ roomId: 1 });
MaintenanceRequestSchema.index({ status: 1 });
MaintenanceRequestSchema.index({ priority: 1 });
MaintenanceRequestSchema.index({ category: 1 });

export default mongoose.model<IMaintenanceRequest>('MaintenanceRequest', MaintenanceRequestSchema); 