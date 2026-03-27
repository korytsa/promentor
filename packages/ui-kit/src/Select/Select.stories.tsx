import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Select } from "./Select";

const options = [
  { value: "design", label: "Design" },
  { value: "development", label: "Development" },
  { value: "product", label: "Product" },
];

const meta = {
  title: "ui-kit/Select",
  component: Select,
  tags: ["autodocs"],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: function Render(args) {
    const [value, setValue] = useState("");
    return (
      <Select
        {...args}
        label="Team"
        value={value}
        onChange={(event) => setValue(String(event.target.value))}
        options={options}
      />
    );
  },
};

export const WithHint: Story = {
  args: {},
  render: function Render(args) {
    const [value, setValue] = useState("");
    return (
      <Select
        {...args}
        label="Role"
        value={value}
        onChange={(event) => setValue(String(event.target.value))}
        options={[
          { value: "mentor", label: "Mentor" },
          { value: "student", label: "Student" },
        ]}
        helperText="Choose your primary role."
      />
    );
  },
};

export const WithError: Story = {
  args: {},
  render: function Render(args) {
    const [value, setValue] = useState("");
    return (
      <Select
        {...args}
        label="Department"
        value={value}
        onChange={(event) => setValue(String(event.target.value))}
        options={options}
        errorMessage={value ? undefined : "Department is required."}
      />
    );
  },
};
