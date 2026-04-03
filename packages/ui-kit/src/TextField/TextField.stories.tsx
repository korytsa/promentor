import type { Meta, StoryObj } from "@storybook/react";
import { TextField } from "./TextField";

const meta = {
  title: "Form/TextField",
  component: TextField,
  tags: ["autodocs"],
  args: {
    label: "Email",
    placeholder: "mentor@example.com",
    size: "sm",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    error: "Please enter a valid email address",
    defaultValue: "invalid-email",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "mentor@example.com",
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <TextField label="Small" size="sm" placeholder="Small input" />
      <TextField label="Medium" size="md" placeholder="Medium input" />
      <TextField label="Large" size="lg" placeholder="Large input" />
    </div>
  ),
};
