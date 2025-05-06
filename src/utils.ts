import * as vscode from "vscode";
import { GODOT_PROJECT_FILEPATH_KEY, NAME } from "./constantes";
import path from "path";
import { glob } from "glob";
import { logger } from "./log";
import { FullPathDir } from "./types";

export {
  getProjectConfig,
  getConfigValue,
  selectTscn,
  applyCodeActionNamed,
  any_undefined,
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
  godot_project_path: FullPathDir
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

const any_undefined = (...vars: any[]): boolean => {
  // return vars.every((p) => p !== undefined) ? false : true;
  for (const v of vars) {
    if (v === undefined) {
      return true;
    }
  }
  return false;
};
