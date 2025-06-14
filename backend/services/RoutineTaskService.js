// backend/services/RoutineTaskService.js
export const createNewRoutineTask = async (data, user) => {
  /* ... */
};
export const getRoutineTasksByDept = async (departmentId, pagination) => {
  /* ... */
};
//...

// backend/services/NotificationService.js
import Notification from "../models/NotificationModel.js";
import { emitToUser } from "../socketManager.js";
export const createNotification = async (notificationData, session) => {
  const notification = (
    await Notification.create([notificationData], { session })
  )[0];
  emitToUser(notification.user, "new-notification", notification);
  return notification;
};
export const markNotificationsAsRead = async (userId, notificationIds) => {
  /* ... */
};
//...

// backend/services/StatisticsService.js
import { getDashboardStatsPipeline } from "../pipelines/Dashboard.js";
export const getDepartmentDashboard = async (departmentId, date) => {
  // Calls the aggregation pipeline and formats the data.
};
//...
