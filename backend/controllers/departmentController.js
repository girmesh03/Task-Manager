// backend/controllers/departmentController.js
import asyncHandler from "express-async-handler";
import * as DepartmentService from "../services/DepartmentService.js";

export const createDepartment = asyncHandler(async (req, res) => {
  const newDepartment = await DepartmentService.createNewDepartment(req.body);
  res
    .status(201)
    .json({ data: newDepartment, message: "Department created successfully." });
});

export const getAllDepartments = asyncHandler(async (req, res) => {
  const result = await DepartmentService.getDepartments(
    req.user,
    req.pagination
  );
  res
    .status(200)
    .json({ data: result, message: "Departments retrieved successfully." });
});

export const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await DepartmentService.getDepartment(
    req.params.departmentId
  );
  res
    .status(200)
    .json({ data: department, message: "Department retrieved successfully." });
});

export const updateDepartmentById = asyncHandler(async (req, res) => {
  const updatedDepartment = await DepartmentService.updateDepartment(
    req.params.departmentId,
    req.body
  );
  res
    .status(200)
    .json({
      data: updatedDepartment,
      message: "Department updated successfully.",
    });
});

export const deleteDepartmentById = asyncHandler(async (req, res) => {
  await DepartmentService.deleteDepartment(req.params.departmentId, req.user);
  res
    .status(200)
    .json({ data: null, message: "Department deleted successfully." });
});
