import { memo, useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import PropTypes from "prop-types";
import { Autocomplete, TextField } from "@mui/material";

import { makeRequest } from "../api/apiRequest";

const MuiAutocomplete = memo(({ name, control, rules, label, ...props }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await makeRequest.get("/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []); // No dependencies required for now

  return (
    <Controller
      name={name}
      control={control}
      rules={rules} // Pass validation rules
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Autocomplete
          multiple
          options={users}
          getOptionLabel={(option) => option.firstName || ""}
          value={users.filter((user) => value?.includes(user._id)) || []}
          onChange={(_, selectedUsers) =>
            onChange(selectedUsers.map((user) => user._id))
          }
          {...props} // Forward additional props
          renderInput={(params) => (
            <TextField
              {...params}
              label={label || "Assign To"}
              fullWidth
              size="small"
              error={!!error}
              helperText={error ? error.message : null}
            />
          )}
        />
      )}
    />
  );
});

MuiAutocomplete.propTypes = {
  name: PropTypes.string.isRequired,
  control: PropTypes.object.isRequired,
  rules: PropTypes.object,
  label: PropTypes.string,
};

export default MuiAutocomplete;
