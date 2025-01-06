import { useEffect } from "react";
import { useLoaderData } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Box } from "@mui/material";

import { setTasks } from "../redux/features/tasks/tasksSlice";

import TasksDataGrid from "../components/TasksDataGrid";

const Tasks = () => {
  const tasks = useLoaderData();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setTasks(tasks));
  }, [dispatch, tasks]);

  return (
    <Box width="100%" height="100%">
      <TasksDataGrid />
    </Box>
  );
};

export default Tasks;
