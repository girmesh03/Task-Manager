import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import softDeletePlugin from './plugins/softDelete.js';
import { FILE_SIZE_LIMITS, LENGTH_LIMITS } from '../utils/constants.js';

const attachmentSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: [true, 'Filename is required'],
      trim: true,
    },
    originalName: {
      type: String,
      required: [true, 'Original name is required'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
    },
    publicId: {
      type: String,
      required: [true, 'Public ID is required'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
    },
    size: {
      type: Number,
      required: [true, 'File size is required'],
      min: [0, 'File size cannot be negative'],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader is required'],
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
attachmentSchema.index({ organization: 1, department: 1 });
attachmentSchema.index({ uploadedBy: 1 });

// Plugins
attachmentSchema.plugin(softDeletePlugin, { ttl: 90 }); // 90 days TTL
attachmentSchema.plugin(mongoosePaginate);

// Validation hook: Check file size based on type
attachmentSchema.pre('save', function () {
  if (this.isNew) {
    const mimeType = this.mimeType.toLowerCase();

    if (mimeType.startsWith('image/') && this.size > FILE_SIZE_LIMITS.MAX_IMAGE_SIZE) {
      throw new Error(`Image size cannot exceed ${FILE_SIZE_LIMITS.MAX_IMAGE_SIZE / 1048576}MB`);
    } else if (mimeType.startsWith('video/') && this.size > FILE_SIZE_LIMITS.MAX_VIDEO_SIZE) {
      throw new Error(`Video size cannot exceed ${FILE_SIZE_LIMITS.MAX_VIDEO_SIZE / 1048576}MB`);
    } else if (
      (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('word') ||
       mimeType.includes('excel') || mimeType.includes('powerpoint') || mimeType.includes('text')) &&
      this.size > FILE_SIZE_LIMITS.MAX_DOCUMENT_SIZE
    ) {
      throw new Error(`Document size cannot exceed ${FILE_SIZE_LIMITS.MAX_DOCUMENT_SIZE / 1048576}MB`);
    } else if (mimeType.startsWith('audio/') && this.size > FILE_SIZE_LIMITS.MAX_AUDIO_SIZE) {
      throw new Error(`Audio size cannot exceed ${FILE_SIZE_LIMITS.MAX_AUDIO_SIZE / 1048576}MB`);
    } else if (this.size > FILE_SIZE_LIMITS.MAX_OTHER_SIZE) {
      throw new Error(`File size cannot exceed ${FILE_SIZE_LIMITS.MAX_OTHER_SIZE / 1048576}MB`);
    }
  }
});

const Attachment = mongoose.model('Attachment', attachmentSchema);

export default Attachment;
