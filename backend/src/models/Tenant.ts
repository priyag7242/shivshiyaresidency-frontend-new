import mongoose, { Document, Schema } from 'mongoose';

export interface ITenant extends Document {
  userId: mongoose.Types.ObjectId;
  roomId?: mongoose.Types.ObjectId;
  personalInfo: {
    fatherName: string;
    motherName: string;
    dateOfBirth: Date;
    bloodGroup?: string;
    emergencyContact: {
      name: string;
      phone: string;
      relation: string;
    };
  };
  address: {
    permanent: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
    current?: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  documents: {
    aadharNumber?: string;
    panNumber?: string;
    aadharImage?: string;
    panImage?: string;
    photo?: string;
  };
  occupancy: {
    joinDate: Date;
    leaveDate?: Date;
    securityDeposit: number;
    monthlyRent: number;
    isActive: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room'
  },
  personalInfo: {
    fatherName: {
      type: String,
      required: [true, 'Father name is required']
    },
    motherName: {
      type: String,
      required: [true, 'Mother name is required']
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    bloodGroup: String,
    emergencyContact: {
      name: {
        type: String,
        required: [true, 'Emergency contact name is required']
      },
      phone: {
        type: String,
        required: [true, 'Emergency contact phone is required']
      },
      relation: {
        type: String,
        required: [true, 'Emergency contact relation is required']
      }
    }
  },
  address: {
    permanent: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true }
    },
    current: {
      street: String,
      city: String,
      state: String,
      pincode: String
    }
  },
  documents: {
    aadharNumber: String,
    panNumber: String,
    aadharImage: String,
    panImage: String,
    photo: String
  },
  occupancy: {
    joinDate: {
      type: Date,
      required: [true, 'Join date is required']
    },
    leaveDate: Date,
    securityDeposit: {
      type: Number,
      required: [true, 'Security deposit is required'],
      min: 0
    },
    monthlyRent: {
      type: Number,
      required: [true, 'Monthly rent is required'],
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

TenantSchema.index({ userId: 1 });
TenantSchema.index({ roomId: 1 });
TenantSchema.index({ 'occupancy.isActive': 1 });

export default mongoose.model<ITenant>('Tenant', TenantSchema); 