import { createAsyncThunk } from "@reduxjs/toolkit";
import moment from "moment";

// api call
import { makeRequest } from "../../../api/apiRequest";

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (task, { rejectWithValue }) => {
    try {
      const { data } = await makeRequest.post("/tasks", task);
      const formattedTasks = {
        ...data,
        id: data._id,
        date: moment(task.date).format("YYYY-MM-DD"),
        week: moment(data.date).isoWeek(),
      };
      return formattedTasks;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async (task, { rejectWithValue }) => {
    try {
      const { data } = await makeRequest.patch(`/tasks/${task.id}`, task);
      const formattedTasks = {
        ...data,
        id: data._id,
        date: moment(task.date).format("YYYY-MM-DD"),
        week: moment(data.date).isoWeek(),
      };
      return formattedTasks;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (taskId, { rejectWithValue }) => {
    try {
      const { data } = await makeRequest.delete(`/tasks/${taskId}`);
      return { taskId, payload: data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
