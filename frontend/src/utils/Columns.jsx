import { Chip } from "@mui/material";
import ExpandableCell from "../components/ExpandableCell";

export const TaskColumns = [
  {
    field: "date",
    headerName: "Date",
    width: 100,
    headerAlign: "center",
  },
  {
    field: "week",
    headerName: "Week",
    width: 60,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "title",
    headerName: "Title",
    width: 150,
    headerAlign: "center",
  },
  {
    field: "description",
    headerName: "Description",
    width: 320,
    headerAlign: "center",
    renderCell: (params) => <ExpandableCell {...params} />,
  },
  {
    field: "priority",
    headerName: "Priority",
    width: 90,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => {
      const priority = params.row.priority;

      const getPriorityColor = () => {
        switch (priority) {
          case "High":
            return "error"; // Red
          case "Medium":
            return "warning"; // Yellow/Orange
          case "Low":
            return "success"; // Green
          default:
            return "default"; // Grey
        }
      };

      return (
        <Chip
          label={priority}
          color={getPriorityColor()}
          variant="outlined"
          size="small"
        />
      );
    },
  },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => {
      const status = params.row.status;

      const getStatusColor = () => {
        switch (status) {
          case "Completed":
            return "success"; // Green
          case "In Progress":
            return "primary"; // Blue
          case "Pending":
            return "warning"; // Yellow
          default:
            return "default"; // Grey
        }
      };

      return (
        <Chip
          label={status}
          color={getStatusColor()}
          variant="outlined"
          size="small"
        />
      );
    },
  },
  {
    field: "assignedTo",
    headerName: "Assigned To",
    width: 100,
    headerAlign: "center",
    renderCell: (params) =>
      params.row.assignedTo.map((user) => user.firstName).join(", "),
  },
];
