import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Typography } from "../Typography";
import { Tabs } from "./Tabs";

const defaultItems = [
  { value: "overview", label: "Overview" },
  { value: "members", label: "Members" },
  { value: "billing", label: "Billing" },
];

const meta = {
  title: "ui-kit/Tabs",
  component: Tabs,
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { items: defaultItems, value: "overview", onChange: () => {} },
  render: function Render(args) {
    const [value, setValue] = useState("overview");
    return (
      <div style={{ width: 460 }}>
        <Tabs
          {...args}
          value={value}
          onChange={setValue}
          items={defaultItems}
        />
        <Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">
          Active tab: {value}
        </Typography>
      </div>
    );
  },
};

export const FullWidth: Story = {
  args: { items: defaultItems, value: "overview", onChange: () => {} },
  render: function Render(args) {
    const [value, setValue] = useState("overview");
    return (
      <div style={{ width: 460 }}>
        <Tabs
          {...args}
          value={value}
          onChange={setValue}
          items={defaultItems}
          variant="fullWidth"
        />
      </div>
    );
  },
};

export const WithDisabledTab: Story = {
  args: { items: defaultItems, value: "overview", onChange: () => {} },
  render: function Render(args) {
    const [value, setValue] = useState("overview");
    return (
      <div style={{ width: 460 }}>
        <Tabs
          {...args}
          value={value}
          onChange={setValue}
          items={[
            { value: "overview", label: "Overview" },
            { value: "members", label: "Members", disabled: true },
            { value: "billing", label: "Billing" },
          ]}
        />
      </div>
    );
  },
};
