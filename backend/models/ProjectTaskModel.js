import mongoose from "mongoose";
import Task from "./TaskModel.js";

/**
 * @typedef {object} Proforma
 * @property {string} url - The URL of the uploaded file.
 * @property {string} public_id - The public_id from Cloudinary for deletion.
 * @property {string} name - The original name of the file.
 * @property {string} type - The type of file (e.g., 'pdf', 'image').
 */

/**
 * @typedef {object} ProjectTask
 * @extends Task
 * @property {object} companyInfo - Information about the external client/company.
 * @property {Array<Proforma>} proforma - An array of proforma/invoice documents.
 */

const projectTaskSchema = new mongoose.Schema({
  companyInfo: {
    name: {
      type: String,
      required: [true, "Company name is required."],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Company phone number is required."],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
  },
  proforma: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
      name: { type: String, required: true, trim: true },
      type: {
        type: String,
        enum: ["image", "pdf", "doc", "xls", "invoice", "receipt", "other"],
        default: "other",
      },
    },
  ],
});

const ProjectTask = Task.discriminator("ProjectTask", projectTaskSchema);
export default ProjectTask;
