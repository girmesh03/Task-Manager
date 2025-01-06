import { useSelector } from "react-redux";
import { Typography, Card, CardContent, Box } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { styled } from "@mui/material/styles";
import TaskIcon from "@mui/icons-material/Task";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[3],
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
  height: "100%",
}));

const StatCard = () => {
  // Fetch tasks from Redux store
  const tasks = useSelector((state) => state.tasks.tasks || []);

  // Compute statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;
  const pendingTasks = tasks.filter((task) => task.status === "Pending").length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  // Prepare data for Pie Chart
  const pieData = [
    { name: "Completed", value: completedTasks, color: "#4caf50" },
    { name: "In Progress", value: inProgressTasks, color: "#ff9800" },
    { name: "Pending", value: pendingTasks, color: "#f44336" },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Task Overview
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Tasks */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TaskIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">Total Tasks</Typography>
                  <Typography variant="h4">{totalTasks}</Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Completed Tasks */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon
                  fontSize="large"
                  color="success"
                  sx={{ mr: 2 }}
                />
                <Box>
                  <Typography variant="h6">Completed Tasks</Typography>
                  <Typography variant="h4">{completedTasks}</Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* In Progress Tasks */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center">
                <HourglassEmptyIcon
                  fontSize="large"
                  color="warning"
                  sx={{ mr: 2 }}
                />
                <Box>
                  <Typography variant="h6">In Progress</Typography>
                  <Typography variant="h4">{inProgressTasks}</Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Pending Tasks */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PendingActionsIcon
                  fontSize="large"
                  color="error"
                  sx={{ mr: 2 }}
                />
                <Box>
                  <Typography variant="h6">Pending Tasks</Typography>
                  <Typography variant="h4">{pendingTasks}</Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Pie Chart */}
      <StyledCard>
        <CardContent>
          <Typography variant="h6" align="center" gutterBottom>
            Task Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </StyledCard>
    </Box>
  );
};

export default StatCard;
