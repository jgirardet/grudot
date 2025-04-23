import path from "path";
import { GODOT_PROJECT_FILEPATH_KEY, GodotSettings, NAME } from "../constantes";
import * as fs from "fs";
import * as os from "os";

export const cloneDirToTemp = (dirpath: string): string => {
  let tmp = fs.mkdtempSync(path.join(os.tmpdir(), "grudot"));
  console.log(`using tmp dur ${tmp}`);
  fs.cpSync(dirpath, tmp, { recursive: true });
  return tmp;
};

export const addGodotProjectPathSetting = (projectPath: string) => {
  fs.writeFileSync(
    path.resolve(projectPath, ".vscode/settings.json"),
    `${NAME}.${GODOT_PROJECT_FILEPATH_KEY}: \"${path.resolve(
      "../../assets/GodotProject/project.godot"
    )}\"`
  );
};

export const getSettings = (filepath: string): GodotSettings | undefined => {
  if (fs.existsSync(filepath)) {
    let settings: GodotSettings = JSON.parse(
      fs.readFileSync(filepath, {
        encoding: "utf-8",
      })
    );
    return settings;
  }
  return undefined;
};
