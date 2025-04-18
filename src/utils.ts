import { ConfigurationScope } from "vscode";
import * as vscode from "vscode";
import { GODOT_PROJECT_FILEPATH_KEY, NAME } from "./constantes";
import path from "path";
import { glob } from "glob";
import { logger } from "./log";

export { get_godot_path, get_project_config, get_config_value, select_tscn };

const get_godot_path = (): string => {
  const godotfp = get_config_value(GODOT_PROJECT_FILEPATH_KEY);
  if (godotfp === undefined || godotfp.length === 0) {
    vscode.window.showErrorMessage(
      "Godot Project is not set. Use Ctrl+Maj+P => <Set Godot Project> to select .godot project file"
    );
    throw new Error("No Godot project Set");
  }

  const gdp = path.dirname(godotfp);
  logger.info(`Godot Project path: ${gdp}`);
  return gdp;
};

const get_project_config = (): vscode.WorkspaceConfiguration => {
  return vscode.workspace.getConfiguration(NAME);
};

const get_config_value = (key: string): string => {
  let v = get_project_config().get<string>(key);
  if (v === undefined) {
    throw new Error(`The config key ${key} is undefined`);
  } else if (v === null) {
    throw new Error(`The config key ${key} is not set`);
  } else {
    return v;
  }
};

const select_tscn = async (
  godot_project_path: string
): Promise<string | undefined> => {
  const tscn_files = await glob("**/*.tscn", { cwd: godot_project_path });
  const selected = await vscode.window.showQuickPick(tscn_files);
  if (selected === undefined) {
    logger.info("No file selected, aborting");
    return;
  }
  logger.info(`${selected} selected`);
  return selected;
};
