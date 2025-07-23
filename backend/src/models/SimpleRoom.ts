import mongoose, { Document, Schema } from 'mongoose';

export interface ISimpleRoom extends Document {
  room_number: number;
  name: string;
  type: string;
  floor: number;
  occupancy: number;
  rent: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  maintenance: number;
  amenities: string[];
}

const SimpleRoomSchema: Schema = new Schema({
  room_number: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  occupancy: {
    type: Number,
    required: true
  },
  rent: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'reserved'],
    default: 'available'
  },
  maintenance: {
    type: Number,
    default: 0
  },
  amenities: [{
    type: String
  }]
}, {
  collection: 'rooms', // Make sure it uses the correct collection name
  timestamps: false // Don't use auto timestamps since we have our own
});

// Index for better performance
SimpleRoomSchema.index({ status: 1 });
SimpleRoomSchema.index({ floor: 1 });

export default mongoose.model<ISimpleRoom>('SimpleRoom', SimpleRoomSchema); 