import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Switch } from "./Switch";

const meta = {
  title: "ui-kit/Switch",
  component: Switch,
  tags: ["autodocs"],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: function Render(args) {
    const [checked, setChecked] = useState(false);
    return (
      <Switch
        {...args}
        label="Enable notifications"
        checked={checked}
        onChange={(_, value) => setChecked(value)}
      />
    );
  },
};

export const WithHelperText: Story = {
  args: {},
  render: function Render(args) {
    const [checked, setChecked] = useState(true);
    return (
      <Switch
        {...args}
        label="Weekly digest"
        checked={checked}
        onChange={(_, value) => setChecked(value)}
        helperText="Receive a summary every Monday."
      />
    );
  },
};

export const WithError: Story = {
  args: {},
  render: function Render(args) {
    const [checked, setChecked] = useState(false);
    return (
      <Switch
        {...args}
        label="Accept terms"
        checked={checked}
        onChange={(_, value) => setChecked(value)}
        errorMessage={checked ? undefined : "You need to enable this option."}
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    label: "Smart mode",
    checked: true,
    disabled: true,
    helperText: "Unavailable on your current plan.",
  },
};

export const WithoutLabel: Story = {
  args: {},
  render: function Render(args) {
    const [checked, setChecked] = useState(false);
    return (
      <Switch
        {...args}
        checked={checked}
        onChange={(_, value) => setChecked(value)}
      />
    );
  },
};
