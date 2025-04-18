import * as vscode from "vscode";
import { insertOnready } from "./commands/insertOnready";
import { setGodotProject } from "./commands/setGodotProject";
import { NAME } from "./constantes";
import { log_error, logger } from "./log";

export function activate(context: vscode.ExtensionContext) {
  logger.info("Extension activating");
  const command_set_project = vscode.commands.registerCommand(
    NAME + "." + "setGodotProject",
    () => log_error(setGodotProject)
  );

  const command_onready = vscode.commands.registerCommand(
    NAME + "." + "insertOnReady",
    () => log_error(insertOnready)
  );

  context.subscriptions.push(command_set_project);
  context.subscriptions.push(command_onready);
}

export function deactivate() {
  logger.info("Extension deactivating ");
}
