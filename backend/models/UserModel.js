import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { deleteFromCloudinary } from "../utils/cloudinaryHelper.js";

/**
 * @typedef {object} User
 * @property {string} firstName - The user's first name.
 * @property {string} lastName - The user's last name.
 * @property {string} position - The user's job title or position.
 * @property {string} email - The user's unique email address.
 * @property {string} password - The user's hashed password.
 * @property {string} role - The user's role ('SuperAdmin', 'Admin', 'Manager', 'User').
 * @property {mongoose.Types.ObjectId} department - The department the user belongs to.
 * @property {object} profilePicture - Cloudinary details for the user's profile picture.
 * @property {boolean} isVerified - Whether the user has verified their email.
 * @property {boolean} isActive - Whether the user's account is active.
 * @property {number} tokenVersion - Used to invalidate JWTs upon password change.
 */

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true, // Use Mongoose's unique index for efficiency.
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address.",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [6, "Password must be at least 6 characters long."],
      select: false, // Exclude password from query results by default.
    },
    role: {
      type: String,
      enum: ["SuperAdmin", "Admin", "Manager", "User"],
      default: "User",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required."],
    },
    profilePicture: {
      public_id: String,
      url: String,
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    verificationTokenExpiry: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpiry: { type: Date, select: false },
    isActive: { type: Boolean, default: true },
    tokenVersion: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      // This transform only runs when .toJSON() is called (e.g., in res.json).
      // It ensures sensitive data is never sent in responses.
      transform: (doc, ret) => {
        delete ret.id;
        delete ret.password;
        delete ret.verificationToken;
        delete ret.verificationTokenExpiry;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpiry;
        delete ret.tokenVersion;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ===================== Virtuals =====================
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ===================== Indexes =====================
// TTL (Time-To-Live) indexes automatically delete documents after a certain time.
// Perfect for temporary tokens.
userSchema.index({ verificationTokenExpiry: 1 }, { expireAfterSeconds: 0 });
userSchema.index({ resetPasswordExpiry: 1 }, { expireAfterSeconds: 0 });
userSchema.index({ department: 1, role: 1 });
userSchema.index({ email: 1 });

// ===================== Plugins =====================
userSchema.plugin(mongoosePaginate);

// ===================== Middleware Hooks =====================

/**
 * Pre-save hook to hash the user's password if it has been modified.
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Pre-deleteOne hook to delete the user's profile picture from Cloudinary.
 */
userSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      if (this.profilePicture?.public_id) {
        await deleteFromCloudinary(this.profilePicture.public_id, "image");
      }
      next();
    } catch (err) {
      next(err);
    }
  }
);

// ===================== Methods =====================

/**
 * Compares an entered password with the user's hashed password.
 * @param {string} enteredPassword - The plain-text password to compare.
 * @returns {Promise<boolean>} - True if the passwords match.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  // Fetch the user with the password field if it wasn't selected.
  const user = await mongoose
    .model("User")
    .findById(this._id)
    .select("+password");
  return await bcrypt.compare(enteredPassword, user.password);
};

/**
 * Generates a verification token and its expiry date.
 */
userSchema.methods.generateVerificationToken = function () {
  this.verificationToken = crypto.randomInt(100000, 999999).toString(); // 6-digit code
  this.verificationTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
};

/**
 * Generates a password reset token and its expiry date.
 */
userSchema.methods.generatePasswordResetToken = function () {
  this.resetPasswordToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
};

const User = mongoose.model("User", userSchema);
export default User;
