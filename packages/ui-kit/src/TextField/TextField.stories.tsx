import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { TextField } from "./TextField";

const meta = {
  title: "ui-kit/TextField",
  component: TextField,
  tags: ["autodocs"],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Email",
    placeholder: "you@example.com",
    fullWidth: true,
  },
};

export const WithHint: Story = {
  args: {
    label: "Password",
    type: "password",
    helperText: "At least 8 characters.",
    fullWidth: true,
  },
};

export const WithErrorMessage: Story = {
  args: {
    label: "Email",
    defaultValue: "invalid",
    errorMessage: "Enter a valid email address.",
    fullWidth: true,
  },
};

export const ControlledErrorToggle: Story = {
  render: function Controlled() {
    const [value, setValue] = useState("");
    const invalid = value.length > 0 && !value.includes("@");
    return (
      <TextField
        label="Email"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        fullWidth
        errorMessage={invalid ? "Must contain @" : undefined}
      />
    );
  },
};
