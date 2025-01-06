import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  IconButton,
  Stack,
  Typography,
  Button,
  Tooltip,
} from "@mui/material";
import { DataGrid, gridClasses } from "@mui/x-data-grid";

import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

import { deleteTask } from "../redux/features/tasks/tasksActions";
import { TaskColumns } from "../utils/Columns";
import CreateUpdateTask from "./CreateUpdateTask";
import CustomToolbar from "./CustomToolbar";

const TasksDataGrid = () => {
  const { loading, tasks } = useSelector((state) => state.tasks);
  const dispatch = useDispatch();

  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setTaskToEdit(null);
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    handleOpenDialog();
  };

  const actionColumns = {
    field: "actions",
    headerName: "Actions",
    width: 130,
    headerAlign: "center",
    renderCell: (params) => (
      <Stack direction="row">
        <Tooltip title="View" arrow>
          <IconButton
            color="primary"
            component={Link}
            to={`/tasks/${params.row.id}`}
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Update Task" arrow>
          <IconButton
            color="secondary"
            onClick={() => handleEditTask(params.row)}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Task" arrow>
          <IconButton
            color="error"
            onClick={() => dispatch(deleteTask(params.row.id))}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    ),
  };

  return (
    <Box sx={{ width: "100%", height: 400 }}>
      {(!tasks || tasks.length === 0) && (
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            No tasks found
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Add Task
          </Button>
        </Box>
      )}
      <CreateUpdateTask
        open={isDialogOpen}
        handleClose={handleCloseDialog}
        task={taskToEdit}
        mode={taskToEdit ? "edit" : "create"}
      />
      <DataGrid
        loading={loading}
        rows={tasks}
        columns={[...TaskColumns, actionColumns]}
        getRowHeight={() => "auto"}
        getEstimatedRowHeight={() => 200}
        pageSizeOptions={[5]}
        disableRowSelectionOnClick
        checkboxSelection
        onRowSelectionModelChange={(newSelectionModel) =>
          setSelectedTaskIds(newSelectionModel)
        }
        selectionModel={selectedTaskIds}
        showCellVerticalBorder
        showColumnVerticalBorder
        initialState={{
          pagination: { paginationModel: { pageSize: 5 } },
        }}
        sx={{
          [`& .${gridClasses.cell}`]: { py: 1 },
          "& .MuiButtonBase-root": { "&.MuiCheckbox-root": { p: 0 } },
          "& .MuiDataGrid-cellCheckbox": {
            alignItems: "flex-start",
          },
        }}
        slots={{
          toolbar: () => (
            <CustomToolbar
              tasks={tasks}
              selectedTaskIds={selectedTaskIds}
              handleOpenDialog={handleOpenDialog}
            />
          ),
        }}
      />
    </Box>
  );
};

export default TasksDataGrid;
