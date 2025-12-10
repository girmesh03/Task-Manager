import mongoose from 'mongoose';
import BaseTask from './BaseTask.js';
import { LIMITS } from '../utils/constants.js';

const routineTaskSchema = new mongoose.Schema({
  materials: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material',
      },
    ],
    validate: [
      (val) => val.length <= LIMITS.MAX_MATERIALS,
      `Cannot have more than ${LIMITS.MAX_MATERIALS} materials`,
    ],
    default: [],
  },
  date: {
    type: Date,
    required: [true, 'Date is required for routine tasks'],
  },
});

// Validation: date cannot be in future
routineTaskSchema.pre('save', function () {
  if (this.date && this.date > new Date()) {
    throw new Error('Routine task date cannot be in the future');
  }
});

const RoutineTask = BaseTask.discriminator('RoutineTask', routineTaskSchema);

export default RoutineTask;
