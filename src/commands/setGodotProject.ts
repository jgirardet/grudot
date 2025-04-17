import * as vscode from "vscode";
import { DISPLAY_NAME, NAME } from "../constantes";

export { setGodotProject };

const setGodotProject = async (channel: vscode.OutputChannel) => {
  const godotfilepath = await vscode.window.showOpenDialog({
    filters: { "Godot Project File": ["godot"] },
    openLabel: "Select .godot project file",
    canSelectFiles: true,
  });
  if (godotfilepath === undefined) {
    channel.appendLine(DISPLAY_NAME + ": No project File selected");
    return;
  }
  vscode.workspace
    .getConfiguration(NAME)
    .update("godotProjectFilePath", godotfilepath[0].fsPath);
};
