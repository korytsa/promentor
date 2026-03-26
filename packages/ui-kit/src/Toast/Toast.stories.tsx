import type { Meta, StoryObj } from "@storybook/react";
import { Toast } from "./Toast";

const meta = {
  title: "ui-kit/Toast",
  component: Toast,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: "100vh", padding: 0 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    open: true,
    autoHideDuration: null,
    tone: "info",
    title: "New update available",
    message: "A new workspace version is ready to install.",
  },
};

export const Success: Story = {
  args: {
    open: true,
    autoHideDuration: null,
    tone: "success",
    title: "Saved successfully",
    message: "Your profile settings have been updated.",
  },
};

export const Warning: Story = {
  args: {
    open: true,
    autoHideDuration: null,
    tone: "warning",
    title: "Payment required",
    message: "Your trial ends in 2 days.",
  },
};

export const Error: Story = {
  args: {
    open: true,
    autoHideDuration: null,
    tone: "error",
    title: "Action failed",
    message: "Unable to sync data. Try again in a minute.",
  },
};
