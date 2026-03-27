import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta = {
  title: "ui-kit/Button",
  component: Button,
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Contained: Story = {
  args: {
    children: "Primary",
    variant: "contained",
    color: "primary",
  },
};

export const Outlined: Story = {
  args: {
    children: "Outlined",
    variant: "outlined",
    color: "primary",
  },
};

export const GhostIcon: Story = {
  args: {
    children: "🔔",
    isIconOnly: true,
    customVariant: "ghost",
    "aria-label": "Notifications",
  },
};

export const GlassIcon: Story = {
  args: {
    children: "☰",
    isIconOnly: true,
    customVariant: "glass",
    "aria-label": "Menu",
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};

export const MenuItemDanger: Story = {
  args: {
    children: (
      <>
        <span>↪</span>
        <span>Log out</span>
      </>
    ),
    variant: "text",
    customVariant: "menuItemDanger",
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};
