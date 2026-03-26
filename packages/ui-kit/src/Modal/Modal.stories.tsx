import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../Button";
import { Typography } from "../Typography";
import { Modal } from "./Modal";

const meta = {
  title: "ui-kit/Modal",
  component: Modal,
  tags: ["autodocs"],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: function Render(args) {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Open modal
        </Button>
        <Modal
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          title="Invite teammate"
          text="Send an invitation link to your colleague."
        />
      </>
    );
  },
};

export const WithFooterActions: Story = {
  args: {},
  render: function Render(args) {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Open with actions
        </Button>
        <Modal
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          title="Delete project"
          text="This action cannot be undone."
          footer={
            <>
              <Button variant="text" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => setOpen(false)}
              >
                Delete
              </Button>
            </>
          }
        />
      </>
    );
  },
};

export const WithoutHeader: Story = {
  args: {},
  render: function Render(args) {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button variant="outlined" onClick={() => setOpen(true)}>
          Open plain modal
        </Button>
        <Modal
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          showCloseButton={false}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            Custom content block
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use this variation when header area is fully custom.
          </Typography>
        </Modal>
      </>
    );
  },
};
