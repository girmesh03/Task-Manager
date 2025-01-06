import moment from "moment";
import { makeRequest } from "../api/apiRequest";

const getTask = async (route, id) => {
  try {
    const response = await makeRequest.get(`/${route}/${id}`);
    return response.data; // Return data directly
  } catch (error) {
    if (error.response) {
      throw error;
    }
  }
};

const getTasks = async (route) => {
  try {
    const response = await makeRequest.get(`/${route}`);
    return response.data; // Return data directly
  } catch (error) {
    if (error.response) {
      throw error;
    }
  }
};

export const dashboardLoader = async () => {
  try {
    const tasks = await getTasks("tasks");
    const formattedTasks = tasks.map((task) => ({
      ...task,
      id: task._id,
      date: moment(task.date).format("YYYY-MM-DD"),
      week: moment(task.date).isoWeek(),
    }));

    return formattedTasks;
  } catch (error) {
    if (error.response) {
      throw error;
    }
  }
};

export const dataLoader = async ({ request, params }) => {
  try {
    const url = new URL(request.url);

    if (params.id) {
      const route = url.pathname.split("/")[1];
      const task = await getTask(route, params.id);
      const formattedTask = {
        ...task,
        id: task._id,
        date: moment(task.date).format("YYYY-MM-DD"),
        week: moment(task.date).isoWeek(),
      };

      return formattedTask;
    } else {
      const route = url.pathname.split("/").pop();
      const tasks = await getTasks(route);
      const formattedTasks = tasks.map((task) => ({
        ...task,
        id: task._id,
        date: moment(task.date).format("YYYY-MM-DD"),
        week: moment(task.date).isoWeek(),
      }));

      return formattedTasks;
    }
  } catch (error) {
    if (error.response) {
      throw error;
    }
  }
};
