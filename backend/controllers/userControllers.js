import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import { User } from '../models/index.js';
import { USER_ROLES, PAGINATION } from '../utils/constants.js';
import CustomError from '../errorHandler/CustomError.js';

// @desc    Create a new user
// @route   POST /api/users
// @access  Private (Admin/Manager)
const createUser = asyncHandler(async (req, res) => {
  // Extract data from req.validated.body (department field already converted from departmentId)
  const {
    firstName,
    lastName,
    email,
    password,
    role,
    department,
    position,
    phone,
    skills,
  } = req.validated.body;

  // Extract { organization } from req.user
  const { organization } = req.user;

  // Start session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.create([{
      firstName,
      lastName,
      email,
      password,
      role: role || USER_ROLES.USER,
      organization: organization._id || organization,
      department,
      position,
      phone,
      skills,
    }], { session });

    await session.commitTransaction();

    // Send welcome email (Mock)
    console.log(`Sending welcome email to ${user[0].email}`);

    // Emit user:created (Mock)
    // req.io.to(organization).emit('user:created', user[0]);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: user[0] },
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getAllUsers = asyncHandler(async (req, res) => {
  // Extract filters from req.validated.query (department field already converted)
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    sortBy = PAGINATION.DEFAULT_SORT_BY,
    sortOrder = PAGINATION.DEFAULT_SORT_ORDER,
    search,
    role,
    department,
    status,
    includeDeleted,
  } = req.validated.query;

  // Extract { organization, department, role, isPlatformUser } from req.user
  const { organization, department: userDept, role: userRole } = req.user;

  // Build query
  const organizationId = organization._id || organization;
  const query = { organization: organizationId };

  // Scoping based on role (Authorization Middleware checks permission to READ, but here we enforce data scoping)
  // Matrix says: Manager Read User -> ownDept. Admin/SuperAdmin -> crossDept (all in org).
  if (userRole === USER_ROLES.MANAGER || userRole === USER_ROLES.USER) {
    // Force department filter to own department
    query.department = userDept._id || userDept;
  } else if (department) {
    // Admin can filter by department
    query.department = department;
  }

  if (role) {
    query.role = role;
  }

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  // Sorting
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  // Pagination options with mongoose-paginate-v2
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort,
    populate: [
      { path: 'department', select: 'name +isDeleted' },
      { path: 'organization', select: 'name +isDeleted' }
    ],
    select: '-password -passwordResetToken -passwordResetExpires',
  };

  // Add withDeleted option if needed
  if (includeDeleted === 'true') {
    options.withDeleted = true;
  }

  // Execute paginated query
  const result = await User.paginate(query, options);

  // Response with pagination metadata
  res.status(200).json({
    success: true,
    data: {
      users: result.docs,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalCount: result.totalDocs,
        totalPages: result.totalPages,
        hasNext: result.hasNextPage,
        hasPrev: result.hasPrevPage,
      },
    },
  });
});

// @desc    Get single user
// @route   GET /api/users/:userId
// @access  Private
const getUser = asyncHandler(async (req, res, next) => {
  // Extract from req.validated.params
  const { userId } = req.validated.params;

  // Extract from req.user
  const { organization, department, role: userRole } = req.user;

  // Business logic + Side Effects
  // Middleware authorize already fetched the user and attached to req.resourceData
  const user = req.resourceData;

  if (!user) {
    throw CustomError.notFound('User not found');
  }

  // Response
  res.status(200).json({
    success: true,
    data: { user },
  });
});

// @desc    Update user
// @route   PUT /api/users/:userId
// @access  Private (Admin/Manager)
const updateUser = asyncHandler(async (req, res, next) => {
  // Extract from req.validated.body
  const validatedData = req.validated.body;

  // Extract from req.validated.params
  const { userId } = req.validated.params;

  // Business logic + Side Effects
  // Target user from middleware
  const user = req.resourceData;

  if (!user) {
    throw CustomError.notFound('User not found');
  }

  // Start session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update fields
    const allowedUpdates = [
      'firstName',
      'lastName',
      'email',
      'role',
      'department',
      'position',
      'phone',
      'skills',
    ];

    allowedUpdates.forEach((field) => {
      if (validatedData[field] !== undefined) {
        user[field] = validatedData[field];
      }
    });

    await user.save({ session });
    await session.commitTransaction();

    // Emit user:updated
    // req.io.to(user.organization).emit('user:updated', user);

    // Response
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user },
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// @desc    Update profile (Self)
// @route   PUT /api/users/:userId/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res, next) => {
  // Extract from req.validated.body
  const validatedData = req.validated.body;

  // Extract from req.user
  const { _id, organization, department } = req.user;

  // Business logic + Side Effects
  // Enforce userId === current user
  if (req.params.userId !== _id.toString()) {
    throw CustomError.unauthorized('You can only update your own profile');
  }

  const user = req.user; // Current user

  const allowedUpdates = [
    'firstName',
    'lastName',
    'email',
    'position',
    'phone',
    'profilePicture',
    'emailPreferences',
  ];

  allowedUpdates.forEach((field) => {
    if (validatedData[field] !== undefined) {
      user[field] = validatedData[field];
    }
  });

  await user.save();

  // Response
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
  });
});

// @desc    Get current user account
// @route   GET /api/users/account
// @access  Private
const getAccount = asyncHandler(async (req, res, next) => {
  // Extract from req.user
  const { _id } = req.user;

  // Business logic + Side Effects
  // Data population
  const user = await User.findById(_id)
    .populate('organization', 'name +isDeleted')
    .populate('department', 'name +isDeleted');

  // Response
  res.status(200).json({
    success: true,
    data: { user },
  });
});

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res, next) => {
  // Extract from req.user
  const { _id } = req.user;

  // Business logic + Side Effects
  // Data population
  const user = await User.findById(_id)
    .populate('organization', 'name +isDeleted')
    .populate('department', 'name +isDeleted');

  // Mock dashboard data
  const dashboardData = {
    tasksAssigned: 5,
    tasksCompleted: 12,
    pendingNotifications: 3,
  };

  // Response
  res.status(200).json({
    success: true,
    data: { user, dashboard: dashboardData },
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:userId
// @access  Private (Admin)
const deleteUser = asyncHandler(async (req, res, next) => {
  // Extract from req.validated.params
  const { userId } = req.validated.params;

  // Extract from req.user
  const { _id, organization, department, role: userRole } = req.user;

  // Business logic + Side Effects
  // Call static softDeleteByIdWithCascade to handle cascade and protections
  await User.softDeleteByIdWithCascade(userId, {
    deletedBy: _id
  });

  // Emit user:deleted
  // req.io.to(organization).emit('user:deleted', userId);

  // Response
  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

// @desc    Restore user
// @route   PATCH /api/users/:userId/restore
// @access  Private (Admin)
const restoreUser = asyncHandler(async (req, res, next) => {
  // Extract from req.validated.params
  const { userId } = req.validated.params;

  // Extract from req.user
  const { organization, department, role: userRole } = req.user;

  // Business logic + Side Effects
  await User.restoreById(userId, {
    restoredBy: req.user._id
  });

  // Emit user:restored
  // req.io.to(organization).emit('user:restored', userId);

  // Response
  res.status(200).json({
    success: true,
    message: 'User restored successfully',
  });
});

export {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  updateProfile,
  getAccount,
  getProfile,
  deleteUser,
  restoreUser};

