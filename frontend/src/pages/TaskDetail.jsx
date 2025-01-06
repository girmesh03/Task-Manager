import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PageHeader } from "@toolpad/core/PageContainer";
import {
  Box,
  Typography,
  Divider,
  Card,
  CardContent,
  Chip,
  Breadcrumbs,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid2";

import { makeRequest } from "../api/apiRequest";

const TaskDetail = () => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  const getTask = useCallback(async () => {
    setLoading(true);
    try {
      const response = await makeRequest.get(`/tasks/${id}`);
      setTask(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    getTask();
  }, [getTask]);

  if (!task || loading) {
    return (
      <Box
        width="100%"
        height="100%"
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          Dashboard
        </Link>
        <Link to="/tasks" style={{ textDecoration: "none", color: "inherit" }}>
          Tasks
        </Link>
        <Typography color="textPrimary">{task.title}</Typography>
      </Breadcrumbs>
      <PageHeader title="Task Detail" />
      <Box mt={2} p={2}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {task.title}
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              {task.description}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  <strong>Status:</strong>{" "}
                  <Chip
                    label={task.status}
                    color={
                      task.status === "In Progress" ? "primary" : "default"
                    }
                  />
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  <strong>Priority:</strong>{" "}
                  <Chip
                    label={task.priority}
                    color={task.priority === "High" ? "error" : "default"}
                  />
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  <strong>Location:</strong> {task.location}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  <strong>Date:</strong>{" "}
                  {new Date(task.date).toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Assigned Personnel:
            </Typography>
            {task.assignedTo.length > 0 ? (
              task.assignedTo.map((person) => (
                <Card key={person._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1">
                      {person.firstName} {person.lastName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Role: {person.position}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Email: {person.email}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                No personnel assigned to this task.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default TaskDetail;
