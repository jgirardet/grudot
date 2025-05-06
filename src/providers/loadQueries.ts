import { readFileSync } from "fs";
import { glob, globSync } from "glob";
import path from "path";

const buildExports = (file: string) =>
  readFileSync(path.resolve(__dirname, file), {
    encoding: "utf-8",
  });

export const godotModuleQuery = buildExports("./godotModule.scm");
