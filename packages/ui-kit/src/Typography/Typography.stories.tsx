import type { Meta, StoryObj } from "@storybook/react";
import { Typography } from "./Typography";

const meta = {
  title: "ui-kit/Typography",
  component: Typography,
  tags: ["autodocs"],
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

export const H5: Story = {
  args: {
    variant: "h5",
    gutterBottom: true,
    children: "Section title",
  },
};

export const Body: Story = {
  args: {
    variant: "body1",
    children:
      "Body text for descriptions and supporting copy across the application.",
  },
};

export const Caption: Story = {
  args: {
    variant: "caption",
    color: "text.secondary",
    children: "Secondary hint text",
  },
};
