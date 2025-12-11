import mongoose from 'mongoose';
import BaseTask from './BaseTask.js';

const projectTaskSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor is required'],
  },
  estimatedCost: {
    type: Number,
    min: [0, 'Estimated cost cannot be negative'],
  },
  actualCost: {
    type: Number,
    min: [0, 'Actual cost cannot be negative'],
  },
  startDate: {
    type: Date,
  },
  dueDate: {
    type: Date,
  },
});

// Validation: dueDate must be after startDate
projectTaskSchema.pre('save', function () {
  if (this.startDate && this.dueDate && this.dueDate < this.startDate) {
    throw new Error('End date must be after start date');
  }
});

const ProjectTask = BaseTask.discriminator('ProjectTask', projectTaskSchema);

export default ProjectTask;
