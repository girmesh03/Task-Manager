import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import softDeletePlugin from './plugins/softDelete.js';
import { MATERIAL_CATEGORIES, UNIT_TYPES, LENGTH_LIMITS } from '../utils/constants.js';

const materialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Material name is required'],
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
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: MATERIAL_CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: {
        values: UNIT_TYPES,
        message: '{VALUE} is not a valid unit',
      },
    },
    unitPrice: {
      type: Number,
      min: [0, 'Unit price cannot be negative'],
    },
    totalPrice: {
      type: Number,
      min: [0, 'Total price cannot be negative'],
    },
    supplier: {
      type: String,
      trim: true,
      maxLength: [
        LENGTH_LIMITS.MAX_NAME_LENGTH,
        `Supplier cannot exceed ${LENGTH_LIMITS.MAX_NAME_LENGTH} characters`,
      ],
    },
    location: {
      type: String,
      trim: true,
      maxLength: [
        LENGTH_LIMITS.MAX_ADDRESS_LENGTH,
        `Location cannot exceed ${LENGTH_LIMITS.MAX_ADDRESS_LENGTH} characters`,
      ],
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
materialSchema.index({ organization: 1, department: 1 });
materialSchema.index({ category: 1 });

// Plugins
materialSchema.plugin(softDeletePlugin, { ttl: 180 }); // 180 days TTL
materialSchema.plugin(mongoosePaginate);

// Pre-save hook: auto-calculate totalPrice
materialSchema.pre('save', function () {
  if (this.unitPrice && this.quantity) {
    this.totalPrice = this.unitPrice * this.quantity;
  }
});

const Material = mongoose.model('Material', materialSchema);

export default Material;
