import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";

import { Box, Typography, Button } from "@mui/material";
import GobackIcon from "@mui/icons-material/FirstPageOutlined";

import NotFound from "../pages/NotFound";

const AppError = () => {
  const navigate = useNavigate();
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.response.status === 404) {
      return <NotFound />;
    }
  }
  // Helper function to get a friendly error message
  const getErrorMessage = (error) => {
    if (!error) return "An unknown error occurred.";

    if (error.response) {
      // Server-side errors
      const status = error.response.status;
      const data = error.response.data;

      if (status === 403)
        return "Access Denied: You do not have permission to view this post.";
      if (status === 404) return "The requested resource was not found.";
      if (status === 500) return "Internal server error.";
      return data?.message || "An error occurred on the server.";
    } else if (error.request) {
      // Network-related errors
      return "Network error: Unable to reach the server. Please check your internet connection.";
    } else {
      // Client-side or unknown errors
      return error.message || "An unexpected error occurred.";
    }
  };

  const errorMessage = getErrorMessage(error);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      padding={2}
      sx={{ height: "calc(100vh - 100px)" }}
    >
      <Typography variant="h4" gutterBottom>
        Oops! Something went wrong.
      </Typography>

      <Typography variant="body1" color="textSecondary" gutterBottom>
        {errorMessage}
      </Typography>

      <Button
        variant="contained"
        size="small"
        startIcon={<GobackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mt: 4 }}
      >
        Go Back
      </Button>
    </Box>
  );
};

export default AppError;
