import PropTypes from "prop-types";
import {
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarColumnsButton,
} from "@mui/x-data-grid";

import { Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";

import generatePDF from "../utils/generatePDF";

const CustomToolbar = ({ tasks, selectedTaskIds, handleOpenDialog }) => {
  const isExportDisabled = selectedTaskIds.length === 0;

  return (
    <GridToolbarContainer
      sx={{ borderBottom: "1px solid", borderColor: "divider" }}
    >
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <Button
        variant="text"
        disabled={isExportDisabled}
        onClick={() => generatePDF(tasks, selectedTaskIds)}
        startIcon={<DownloadIcon />}
      >
        Export As PDF
      </Button>
      <Button variant="text" onClick={handleOpenDialog} startIcon={<AddIcon />}>
        Add Task
      </Button>
    </GridToolbarContainer>
  );
};

CustomToolbar.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedTaskIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  handleOpenDialog: PropTypes.func.isRequired,
};

export default CustomToolbar;
