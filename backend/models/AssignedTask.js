import mongoose from 'mongoose';
import BaseTask from './BaseTask.js';

const assignedTaskSchema = new mongoose.Schema({
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assignee is required for assigned tasks'],
  },
  dueDate: {
    type: Date,
  },
  completedDate: {
    type: Date,
  },
});

// Validation: completedDate must be after dueDate if both exist
assignedTaskSchema.pre('save', function () {
  if (this.dueDate && this.completedDate && this.completedDate < this.dueDate) {
    throw new Error('Completed date cannot be before due date');
  }
});

const AssignedTask = BaseTask.discriminator('AssignedTask', assignedTaskSchema);

export default AssignedTask;
