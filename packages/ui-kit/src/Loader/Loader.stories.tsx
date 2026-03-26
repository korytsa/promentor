import type { Meta, StoryObj } from "@storybook/react";
import { Loader } from "./Loader";

const meta = {
  title: "ui-kit/Loader",
  component: Loader,
  tags: ["autodocs"],
} satisfies Meta<typeof Loader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: "md",
  },
};

export const WithLabel: Story = {
  args: {
    size: "md",
    label: "Loading data...",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    label: "Syncing",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    label: "Preparing dashboard",
  },
};

export const FullScreen: Story = {
  args: {
    size: "lg",
    label: "Please wait",
    fullScreen: true,
  },
  parameters: {
    layout: "fullscreen",
  },
};
