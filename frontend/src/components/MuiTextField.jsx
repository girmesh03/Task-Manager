import TextField from "@mui/material/TextField";
import { Controller } from "react-hook-form";
import propTypes from "prop-types";

const MuiTextField = ({
  name,
  control,
  rules,
  label,
  type = "text",
  multiline = false,
  rows = 1,
  select = false,
  children,
  ...props
}) => (
  <Controller
    name={name}
    control={control}
    rules={rules}
    render={({ field, fieldState: { error } }) => (
      <TextField
        {...field}
        label={label}
        type={type}
        fullWidth
        required={!!rules?.required}
        size="small"
        multiline={multiline}
        rows={rows}
        select={select}
        error={!!error}
        helperText={error?.message}
        {...props}
      >
        {select && children}
      </TextField>
    )}
  />
);

MuiTextField.propTypes = {
  name: propTypes.string.isRequired,
  control: propTypes.object.isRequired,
  rules: propTypes.object,
  label: propTypes.string,
  type: propTypes.string,
  multiline: propTypes.bool,
  rows: propTypes.number,
  select: propTypes.bool,
  children: propTypes.node,
};

export default MuiTextField;
