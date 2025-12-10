import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import softDeletePlugin from './plugins/softDelete.js';
import { LENGTH_LIMITS } from '../utils/constants.js';

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vendor name is required'],
      trim: true,
      maxLength: [
        LENGTH_LIMITS.MAX_NAME_LENGTH,
        `Name cannot exceed ${LENGTH_LIMITS.MAX_NAME_LENGTH} characters`,
      ],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [
        LENGTH_LIMITS.MAX_DESCRIPTION_LENGTH,
        `Description cannot exceed ${LENGTH_LIMITS.MAX_DESCRIPTION_LENGTH} characters`,
      ],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([ .-]?\w+)*@\w+([ .-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
      maxLength: [
        LENGTH_LIMITS.MAX_EMAIL_LENGTH,
        `Email cannot exceed ${LENGTH_LIMITS.MAX_EMAIL_LENGTH} characters`,
      ],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+[1-9]\d{1,14}$/, 'Please provide a valid E.164 phone number'],
      maxLength: [
        LENGTH_LIMITS.MAX_PHONE_LENGTH,
        `Phone cannot exceed ${LENGTH_LIMITS.MAX_PHONE_LENGTH} characters`,
      ],
    },
    address: {
      type: String,
      trim: true,
      maxLength: [
        LENGTH_LIMITS.MAX_ADDRESS_LENGTH,
        `Address cannot exceed ${LENGTH_LIMITS.MAX_ADDRESS_LENGTH} characters`,
      ],
    },
    contactPerson: {
      type: String,
      trim: true,
      maxLength: [
        LENGTH_LIMITS.MAX_NAME_LENGTH,
        `Contact person cannot exceed ${LENGTH_LIMITS.MAX_NAME_LENGTH} characters`,
      ],
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes - Organization-scoped unique constraints
vendorSchema.index(
  { organization: 1, email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false, email: { $exists: true } } }
);
vendorSchema.index(
  { organization: 1, phone: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false, phone: { $exists: true } } }
);

// Plugins
vendorSchema.plugin(softDeletePlugin, { ttl: 180 }); // 180 days TTL
vendorSchema.plugin(mongoosePaginate);

const Vendor = mongoose.model('Vendor', vendorSchema);

export default Vendor;
