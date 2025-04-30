import { defineConfig } from "@vscode/test-cli";

export default defineConfig([
  {
    label: "unitTests",
    files: "out/test/unit/*.test.js",
    version: "insiders",
    workspaceFolder: "./assets/noConfigProject",
    mocha: {
      ui: "tdd",
      timeout: 20000,
    },
  },
  // you can specify additional test configurations, too
]);
