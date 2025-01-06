import { useEffect } from "react";
import propTypes from "prop-types";
import { useForm } from "react-hook-form";
import moment from "moment";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ListAltIcon from "@mui/icons-material/ListAlt";

import { useDispatch } from "react-redux";
import { createTask, updateTask } from "../redux/features/tasks/tasksActions";
import MuiTextField from "../components/MuiTextField";
import { Stack } from "@mui/material";
import MuiAutocomplete from "./MuiAutocomplete";

const CreateUpdateTask = ({
  open,
  handleClose,
  task = {},
  mode = "create",
}) => {
  const dispatch = useDispatch();

  const { handleSubmit, control, reset, setValue } = useForm({
    defaultValues: {
      date: "",
      location: "",
      title: "",
      description: "",
      status: "",
      priority: "",
      assignedTo: [],
    },
  });

  useEffect(() => {
    if (task && mode === "edit") {
      Object.entries(task).forEach(([key, value]) =>
        setValue(
          key,
          key === "date" ? moment(task.date).format("YYYY-MM-DD") : value
        )
      );
    }
  }, [task, mode, setValue]);

  const onSubmit = (data) => {
    if (mode === "create") {
      dispatch(createTask(data));
    } else if (mode === "edit") {
      dispatch(
        updateTask({
          ...data,
          id: task.id,
          date: moment(task.date).format("YYYY-MM-DD"),
          week: moment(task.date).isoWeek(),
        })
      );
    }
    handleClose();
    reset();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle id="form-dialog-title">
          {mode === "create" ? "Create New Task" : "Edit Task"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ maxWidth: 600, py: 2 }}>
            <Stack
              rowGap={2}
              columnGap={2}
              sx={{ flexDirection: { xs: "column", sm: "row" }, mb: 2 }}
            >
              <MuiTextField
                name="date"
                control={control}
                rules={{ required: "Date is required" }}
                type="date"
              />
              <MuiAutocomplete
                name="assignedTo"
                control={control}
                rules={{ required: "At least one user must be assigned" }}
                label="Assign Users"
                fullWidth
              />
            </Stack>
            <MuiTextField
              name="location"
              control={control}
              rules={{ required: "Location is required" }}
              label="Location"
              sx={{ mb: 2 }}
            />
            <MuiTextField
              name="title"
              control={control}
              rules={{ required: "Title is required" }}
              label="Title"
              sx={{ mb: 2 }}
            />
            <MuiTextField
              name="description"
              control={control}
              rules={{ required: "Description is required" }}
              label="Description"
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
            <Stack
              rowGap={2}
              columnGap={2}
              justifyContent="center"
              alignItems="center"
              sx={{ flexDirection: { xs: "column", sm: "row" } }}
            >
              <MuiTextField
                name="status"
                control={control}
                rules={{ required: "Status is required" }}
                label="Status"
                select
              >
                <MenuItem value="Completed">
                  <Box display="flex" alignItems="center">
                    <CheckCircleIcon sx={{ mr: 1 }} /> Completed
                  </Box>
                </MenuItem>
                <MenuItem value="In Progress">
                  <Box display="flex" alignItems="center">
                    <HourglassEmptyIcon sx={{ mr: 1 }} /> In Progress
                  </Box>
                </MenuItem>
                <MenuItem value="Pending">
                  <Box display="flex" alignItems="center">
                    <PendingActionsIcon sx={{ mr: 1 }} /> Pending
                  </Box>
                </MenuItem>
                <MenuItem value="To Do">
                  <Box display="flex" alignItems="center">
                    <ListAltIcon sx={{ mr: 1 }} /> To Do
                  </Box>
                </MenuItem>
              </MuiTextField>

              <MuiTextField
                name="priority"
                control={control}
                rules={{ required: "Priority is required" }}
                label="Priority"
                select
              >
                <MenuItem value="High">
                  <Box display="flex" alignItems="center">
                    <CheckCircleIcon sx={{ mr: 1, color: "red" }} /> High
                  </Box>
                </MenuItem>
                <MenuItem value="Medium">
                  <Box display="flex" alignItems="center">
                    <HourglassEmptyIcon sx={{ mr: 1, color: "orange" }} />{" "}
                    Medium
                  </Box>
                </MenuItem>
                <MenuItem value="Low">
                  <Box display="flex" alignItems="center">
                    <ListAltIcon sx={{ mr: 1, color: "green" }} /> Low
                  </Box>
                </MenuItem>
              </MuiTextField>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {mode === "create" ? "Create Task" : "Update Task"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

CreateUpdateTask.propTypes = {
  open: propTypes.bool.isRequired,
  handleClose: propTypes.func.isRequired,
  task: propTypes.object,
  mode: propTypes.oneOf(["create", "edit"]),
};

export default CreateUpdateTask;
