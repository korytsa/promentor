import type { Preview } from "@storybook/react";
import { AppThemeProvider } from "../src/Theme";

const preview: Preview = {
  decorators: [
    (Story) => (
      <AppThemeProvider>
        <div style={{ minWidth: 280, padding: 16 }}>
          <Story />
        </div>
      </AppThemeProvider>
    ),
  ],
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "surface",
      values: [
        { name: "surface", value: "#f4f4f5" },
        { name: "dark", value: "#0f172a" },
      ],
    },
  },
};

export default preview;
