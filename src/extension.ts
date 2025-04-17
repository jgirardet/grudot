import * as vscode from "vscode";
import { insertOnready } from "./commands/insertOnready";
import { setGodotProject } from "./commands/setGodotProject";
import { NAME } from "./constantes";

export function activate(context: vscode.ExtensionContext) {
  let channel = vscode.window.createOutputChannel(NAME);

  const command_set_project = vscode.commands.registerCommand(
    NAME + "." + "setGodotProject",
    () => setGodotProject(channel)
  );

  const command_onready = vscode.commands.registerCommand(
    NAME + "." + "insertOnReady",
    () => insertOnready(channel)
  );

  context.subscriptions.push(command_set_project);
  context.subscriptions.push(command_onready);
}

export function deactivate() {}
