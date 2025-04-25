import * as vscode from "vscode";
import { GODOT_PROJECT_FILEPATH_KEY, NAME } from "./constantes";
import path from "path";
import { glob } from "glob";
import { logger } from "./log";
import { existsSync } from "fs";

export {
  getDotGodotPath,
  getProjectConfig,
  getConfigValue,
  selectTscn,
  getRustSrc,
  applyCodeActionNamed,
};

const getDotGodotPath = (): string => {
  const godotfp = getConfigValue(GODOT_PROJECT_FILEPATH_KEY);
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

const getProjectConfig = (): vscode.WorkspaceConfiguration => {
  return vscode.workspace.getConfiguration(NAME);
};

const getConfigValue = (key: string): string => {
  let v = getProjectConfig().get<string>(key);
  if (v === undefined) {
    throw new Error(`The config key ${key} is undefined`);
  } else if (v === null) {
    throw new Error(`The config key ${key} is not set`);
  } else {
    return v;
  }
};

const selectTscn = async (
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

/// Try to return rust/src/ folder and fallback workspace
const getRustSrc = async (): Promise<string | undefined> => {
  let cargo = await vscode.workspace.findFiles("Cargo.toml");
  if (cargo.length === 1) {
    let base = path.dirname(cargo[0].fsPath);
    if (existsSync(path.join(base, "src/"))) {
      return path.join(base, "src/");
    } else {
      return base;
    }
  }
  return vscode.workspace.workspaceFolders?.at(0)?.uri.path;
};

/// Apply the code titled at current cursor position
const applyCodeActionNamed = async (
  editor: vscode.TextEditor,
  title: string
) => {
  const { document, selection } = editor;
  const range = selection.isEmpty
    ? new vscode.Range(selection.start, selection.start)
    : selection;

  const actions = await vscode.commands.executeCommand<vscode.CodeAction[]>(
    "vscode.executeCodeActionProvider",
    document.uri,
    range,
    vscode.CodeActionKind.QuickFix.value
  );

  if (actions?.length) {
    const action = actions.find((f) => f.title === title);
    if (action === undefined) {
      return;
    }
    if (action.edit) {
      await vscode.workspace.applyEdit(action.edit);
    }
  }
};
