import mongoose, { Document, Schema } from 'mongoose';

export interface ISimpleTenant extends Document {
  id: string;
  name: string;
  mobile: number;
  room_number: string;
  joining_date: Date;
  monthly_rent: number;
  security_deposit: number;
  electricity_joining_reading: number;
  last_electricity_reading: number;
  status: 'active' | 'adjust' | 'inactive';
  created_date: Date;
  created_at: string;
  updated_at: string;
  has_food: boolean;
  category: 'existing' | 'new';
  stay_duration?: string;
  notice_given: boolean;
  departure_date?: string;
  notice_date?: string;
  security_adjustment: number;
}

const SimpleTenantSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  mobile: {
    type: Number,
    required: true
  },
  room_number: {
    type: String,
    required: true
  },
  joining_date: {
    type: Date,
    required: true
  },
  monthly_rent: {
    type: Number,
    required: true
  },
  security_deposit: {
    type: Number,
    required: true
  },
  electricity_joining_reading: {
    type: Number,
    required: true
  },
  last_electricity_reading: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'adjust', 'inactive'],
    default: 'active'
  },
  created_date: {
    type: Date,
    required: true
  },
  created_at: {
    type: String,
    required: true
  },
  updated_at: {
    type: String,
    required: true
  },
  has_food: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['existing', 'new'],
    default: 'existing'
  },
  stay_duration: {
    type: String,
    default: 'unknown'
  },
  notice_given: {
    type: Boolean,
    default: false
  },
  departure_date: {
    type: String,
    default: null
  },
  notice_date: {
    type: String,
    default: null
  },
  security_adjustment: {
    type: Number,
    default: 0
  }
}, {
  collection: 'tenants', // Make sure it uses the correct collection name
  timestamps: false // Don't use auto timestamps since we have our own
});

// Index for better performance
SimpleTenantSchema.index({ status: 1 });

export default mongoose.model<ISimpleTenant>('SimpleTenant', SimpleTenantSchema); 