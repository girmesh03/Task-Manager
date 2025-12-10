import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import softDeletePlugin from './plugins/softDelete.js';
import { INDUSTRIES, LENGTH_LIMITS } from '../utils/constants.js';

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      lowercase: true,
      maxLength: [
        LENGTH_LIMITS.ORG_NAME_MAX,
        `Name cannot exceed ${LENGTH_LIMITS.ORG_NAME_MAX} characters`,
      ],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [
        LENGTH_LIMITS.DESCRIPTION_MAX,
        `Description cannot exceed ${LENGTH_LIMITS.DESCRIPTION_MAX} characters`,
      ],
    },
    email: {
      type: String,
      required: [true, 'Organization email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
      maxLength: [
        LENGTH_LIMITS.EMAIL_MAX,
        `Email cannot exceed ${LENGTH_LIMITS.EMAIL_MAX} characters`,
      ],
    },
    phone: {
      type: String,
      required: [true, 'Organization phone is required'],
      trim: true,
      match: [/^\+[1-9]\d{1,14}$/, 'Please provide a valid E.164 phone number'],
      maxLength: [
        LENGTH_LIMITS.PHONE_MAX,
        `Phone cannot exceed ${LENGTH_LIMITS.PHONE_MAX} characters`,
      ],
    },
    address: {
      type: String,
      trim: true,
      maxLength: [
        LENGTH_LIMITS.ADDRESS_MAX,
        `Address cannot exceed ${LENGTH_LIMITS.ADDRESS_MAX} characters`,
      ],
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      enum: {
        values: INDUSTRIES,
        message: '{VALUE} is not a valid industry',
      },
    },
    logoUrl: {
      url: String,
      publicId: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // required: true, // Can't be required on creation of first user/org
    },
    isPlatformOrg: {
      type: Boolean,
      default: false,
      immutable: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
organizationSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
organizationSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
organizationSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
organizationSchema.index({ isPlatformOrg: 1 });

// Plugins
organizationSchema.plugin(softDeletePlugin);
organizationSchema.plugin(mongoosePaginate);

// Pre-save hooks
organizationSchema.pre('save', async function () {
  // Enforce only ONE platform organization globally
  if (this.isNew && this.isPlatformOrg) {
    const existingPlatformOrg = await this.constructor.findOne({
      isPlatformOrg: true,
      isDeleted: false
    });

    if (existingPlatformOrg) {
      throw new Error('Only one platform organization is allowed. A platform organization already exists.');
    }
  }

  if (this.createdBy) {
    // Validate createdBy belongs to this organization (logic to be implemented if needed,
    // but circular dependency prevents checking User model here easily without careful handling)
    // For now, we assume controller handles the logic of ensuring the creator is valid.
  }
});

// Static methods
organizationSchema.statics.softDeleteByIdWithCascade = async function (
  id,
  { session, deletedBy } = {}
) {
  const org = await this.findById(id).session(session);
  if (!org) {
    throw new Error('Organization not found');
  }

  if (org.isPlatformOrg) {
    throw new Error('Cannot delete platform organization');
  }

  // Soft delete the organization
  await this.softDeleteById(id, { session, deletedBy });

  // Cascade delete logic will be implemented here or in a service
  // Typically we would find all related departments, users, etc. and soft delete them too.
  // Ideally, we emit an event or call a service method to handle the cascade to avoid circular deps.
  // For this phase, we'll leave a placeholder comment.
  // await mongoose.model('Department').softDeleteMany({ organization: id }, { session, deletedBy });
  // await mongoose.model('User').softDeleteMany({ organization: id }, { session, deletedBy });
};

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
