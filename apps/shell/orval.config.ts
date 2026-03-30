import { defineConfig } from "orval";

export default defineConfig({
  promentorApi: {
    input: {
      target: "../api/openapi.json",
      filters: {
        mode: "include",
        tags: ["auth"],
      },
    },
    output: {
      mode: "single",
      target: "./src/shared/api/generated/api.ts",
      client: "react-query",
      override: {
        mutator: {
          path: "./src/shared/api/orval-mutator.ts",
          name: "customInstance",
        },
      },
    },
  },
});
