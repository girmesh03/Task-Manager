import { useState } from "react";
import PropTypes from "prop-types";
import Link from "@mui/material/Link";

const ExpandableCell = ({ value }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      {expanded ? value : value.slice(0, 200)}&nbsp;
      {value.length > 200 && (
        <Link
          type="button"
          component="button"
          sx={{ fontSize: "inherit", letterSpacing: "inherit" }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "View less" : "View more"}
        </Link>
      )}
    </div>
  );
};

ExpandableCell.propTypes = {
  value: PropTypes.string.isRequired,
};

export default ExpandableCell;
