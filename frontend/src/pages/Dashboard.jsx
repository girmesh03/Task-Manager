import { useEffect } from "react";
import { useLoaderData } from "react-router-dom";
import { Box } from "@mui/material";

import { useDispatch } from "react-redux";
import { setTasks } from "../redux/features/tasks/tasksSlice";

import StatCard from "../components/StatCard";

const Dashboard = () => {
  const tasks = useLoaderData();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setTasks(tasks));
  }, [dispatch, tasks]);

  return (
    <Box width="100%" height="100%">
      <StatCard />
    </Box>
  );
};

export default Dashboard;
