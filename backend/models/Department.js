import mongoose from 'mongoose';
import softDeletePlugin from './plugins/softDelete.js';
import { LENGTH_LIMITS } from '../utils/constants.js';

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      maxLength: [
        LENGTH_LIMITS.DEPT_NAME_MAX,
        `Name cannot exceed ${LENGTH_LIMITS.DEPT_NAME_MAX} characters`,
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
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // required: true, // Can't be required on creation of first user/dept
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
departmentSchema.index(
  { organization: 1, name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

// Plugins
departmentSchema.plugin(softDeletePlugin);

// Pre-save hooks
departmentSchema.pre('save', async function () {
  if (this.isNew) {
    // Validate organization exists
    const Organization = mongoose.model('Organization');
    const org = await Organization.findById(this.organization);
    if (!org) {
      throw new Error('Organization not found');
    }

    if (this.createdBy) {
      // Validate createdBy belongs to organization (logic deferred to controller/service to avoid circular dep)
    }
  }
});

// Static methods
departmentSchema.statics.softDeleteByIdWithCascade = async function (
  id,
  { session, deletedBy } = {}
) {
  const dept = await this.findById(id).session(session);
  if (!dept) {
    throw new Error('Department not found');
  }

  // Soft delete the department
  await this.softDeleteById(id, { session, deletedBy });

  // Cascade delete logic placeholder
  // await mongoose.model('User').softDeleteMany({ department: id }, { session, deletedBy });
};

const Department = mongoose.model('Department', departmentSchema);

export default Department;
