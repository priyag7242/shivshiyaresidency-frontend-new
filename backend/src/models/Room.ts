import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  roomNumber: string;
  floor: number;
  type: 'single' | 'double' | 'triple' | 'quad';
  capacity: number;
  currentOccupancy: number;
  rent: number;
  amenities: string[];
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  description?: string;
  images?: string[];
  tenants: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema: Schema = new Schema({
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    unique: true,
    trim: true
  },
  floor: {
    type: Number,
    required: [true, 'Floor is required'],
    min: 0
  },
  type: {
    type: String,
    enum: ['single', 'double', 'triple', 'dormitory'],
    required: [true, 'Room type is required']
  },
  capacity: {
    type: Number,
    required: [true, 'Room capacity is required'],
    min: 1
  },
  currentOccupancy: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: function(this: IRoom, value: number) {
        return value <= this.capacity;
      },
      message: 'Current occupancy cannot exceed room capacity'
    }
  },
  rent: {
    type: Number,
    required: [true, 'Room rent is required'],
    min: 0
  },
  amenities: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'reserved'],
    default: 'available'
  },
  description: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  tenants: [{
    type: Schema.Types.ObjectId,
    ref: 'Tenant'
  }]
}, {
  timestamps: true
});

RoomSchema.index({ roomNumber: 1 });
RoomSchema.index({ status: 1 });
RoomSchema.index({ type: 1 });
RoomSchema.index({ floor: 1 });

// Update status based on occupancy
RoomSchema.pre('save', function(this: IRoom, next: () => void) {
  if (this.currentOccupancy === 0) {
    this.status = 'available';
  } else if (this.currentOccupancy >= this.capacity) {
    this.status = 'occupied';
  }
  next();
});

export default mongoose.model<IRoom>('Room', RoomSchema); 