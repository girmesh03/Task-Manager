import { body, param, query } from 'express-validator';
import { Attachment } from '../../models/index.js';
import validate from './validation.js';
import {
  ATTACHMENT_TYPES_ARRAY,
  ATTACHMENT_TYPES,
  PAGINATION,
  LIMITS,
  LENGTH_LIMITS,
  FILE_SIZE_LIMITS
} from '../../utils/constants.js';

const validateAttachmentsArray = body('attachments')
  .optional({ nullable: true })
  .isArray()
  .withMessage('Attachments must be an array')
  .bail()
  .custom((array) => {
    if (array && array?.length > LIMITS.MAX_ATTACHMENTS) {
      throw new Error(
        `Attachments cannot exceed ${LIMITS.MAX_ATTACHMENTS}`
      );
    }
    return true;
  });

const validateAttachmentFields = [
  body('attachments.*.originalName')
    .if(body('attachments').exists())
    .exists({ checkFalsy: true })
    .withMessage('Attachment original name is required')
    .bail()
    .isString()
    .withMessage('Original name must be a string')
    .bail()
    .trim()
    .isLength({ max: LENGTH_LIMITS.MAX_NAME_LENGTH })
    .withMessage(
      `Original name cannot exceed ${LENGTH_LIMITS.MAX_NAME_LENGTH} characters`
    ),

  body('attachments.*.storedName')
    .if(body('attachments').exists())
    .exists({ checkFalsy: true })
    .withMessage('Attachment stored name is required')
    .bail()
    .isString()
    .withMessage('Stored name must be a string')
    .bail()
    .trim(),

  body('attachments.*.mimeType')
    .if(body('attachments').exists())
    .exists({ checkFalsy: true })
    .withMessage('MIME type is required')
    .bail()
    .isString()
    .withMessage('MIME type must be a string')
    .bail()
    .trim(),

  body('attachments.*.size')
    .if(body('attachments').exists())
    .exists({ checkFalsy: true })
    .withMessage('File size is required')
    .bail()
    .isInt({ min: 0 })
    .withMessage('File size must be a non-negative integer')
    .bail()
    .custom((size, { req, path }) => {
      const idxMatch = path.match(/\[(\d+)\]/);
      const attachmentIndex = idxMatch ? parseInt(idxMatch[1], 10) : -1;
      const attachmentType =
        attachmentIndex >= 0
          ? req.body.attachments[attachmentIndex]?.type
          : 'other';

      let maxSize;
      switch (attachmentType) {
        case ATTACHMENT_TYPES.IMAGE:
          maxSize = FILE_SIZE_LIMITS.MAX_IMAGE_SIZE;
          break;
        case ATTACHMENT_TYPES.VIDEO:
          maxSize = FILE_SIZE_LIMITS.MAX_VIDEO_SIZE;
          break;
        case ATTACHMENT_TYPES.DOCUMENT:
          maxSize = FILE_SIZE_LIMITS.MAX_DOCUMENT_SIZE;
          break;
        case ATTACHMENT_TYPES.AUDIO:
          maxSize = FILE_SIZE_LIMITS.MAX_AUDIO_SIZE;
          break;
        default:
          maxSize = FILE_SIZE_LIMITS.MAX_OTHER_SIZE;
      }

      if (Number(size) > maxSize) {
        throw new Error(
          `File size exceeds maximum allowed for ${attachmentType} files (${
            maxSize / (1024 * 1024)
          }MB)`
        );
      }
      return true;
    }),

  body('attachments.*.type')
    .if(body('attachments').exists())
    .exists({ checkFalsy: true })
    .withMessage('Attachment type is required')
    .bail()
    .isIn(ATTACHMENT_TYPES_ARRAY)
    .withMessage(
      `Attachment type must be one of: ${ATTACHMENT_TYPES_ARRAY.join(', ')}`
    ),

  body('attachments.*.url')
    .if(body('attachments').exists())
    .exists({ checkFalsy: true })
    .withMessage('File URL is required')
    .bail()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('File URL must be a valid HTTP or HTTPS URL'),

  body('attachments.*.publicId')
    .if(body('attachments').exists())
    .exists({ checkFalsy: true })
    .withMessage('Cloudinary publicId is required')
    .bail()
    .isString()
    .withMessage('Public ID must be a string')
    .bail()
    .trim(),

  body('attachments.*.format')
    .if(body('attachments').exists())
    .optional({ nullable: true })
    .isString()
    .withMessage('Format must be a string')
    .bail()
    .trim(),
  body('attachments.*.width')
    .if(body('attachments').exists())
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('Width must be a non-negative integer'),
  body('attachments.*.height')
    .if(body('attachments').exists())
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('Height must be a non-negative integer'),
];

const validateCreateAttachment = [
  // File upload validation is usually handled by multer before this.
  // But if we are passing metadata, we can validate it.
  // Assuming we might pass 'entityType' and 'entityId' in body if not using multipart/form-data for everything?
  // Or if we upload separately and then link.
  // For now, let's assume we validate the metadata if provided.
  body('entityType')
    .optional()
    .isIn(['BaseTask', 'TaskActivity', 'TaskComment'])
    .withMessage('Invalid entity type. Must be one of: BaseTask, TaskActivity, TaskComment'),
  body('entityId')
    .optional()
    .isMongoId()
    .withMessage('Invalid entity ID'),
  validate,
];

const validateGetAttachment = [
  param('attachmentId')
    .isMongoId()
    .withMessage('Invalid attachment ID')
    .custom(async (value) => {
      const att = await Attachment.findById(value).withDeleted();
      if (!att) {
        throw new Error('Attachment not found');
      }
      return true;
    }),
  validate,
];

const validateDeleteAttachment = [
  param('attachmentId')
    .isMongoId()
    .withMessage('Invalid attachment ID')
    .custom(async (value) => {
      const att = await Attachment.findById(value).withDeleted();
      if (!att) {
        throw new Error('Attachment not found');
      }
      return true;
    }),
  validate,
];

const validateGetAllAttachments = [
  query('page')
    .optional()
    .isInt({ min: 1 }),
  query('limit')
    .optional()
    .isInt({ min: 1, max: PAGINATION.MAX_LIMIT }),
  query('type')
    .optional()
    .isIn(ATTACHMENT_TYPES_ARRAY),
  query('entityType')
    .optional()
    .isIn(['BaseTask', 'TaskActivity', 'TaskComment'])
    .withMessage('Invalid entity type. Must be one of: BaseTask, TaskActivity, TaskComment'),
  query('entityId')
    .optional()
    .isMongoId(),
  query('sortBy')
    .optional()
    .isString(),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc']),
  query('deleted')
    .optional()
    .isBoolean()
    .withMessage('Deleted must be a boolean'),
  validate,
];

export {
  validateCreateAttachment,
  validateGetAttachment,
  validateDeleteAttachment,
  validateGetAllAttachments,
  validateAttachmentsArray,
  validateAttachmentFields
};
