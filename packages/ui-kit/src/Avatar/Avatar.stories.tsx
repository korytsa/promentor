import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./Avatar";

const meta = {
  title: "ui-kit/Avatar",
  component: Avatar,
  tags: ["autodocs"],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  args: {
    alt: "User",
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    size: "md",
  },
};

export const Initials: Story = {
  args: {
    alt: "John Doe",
    size: "lg",
  },
};

export const Small: Story = {
  args: {
    alt: "A",
    size: "sm",
  },
};
