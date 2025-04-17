import { glob } from "glob";
import * as vscode from "vscode";
import { NodesBuilder } from "../NodesBuilder";
import { onready_snippet } from "../snippets";
import { get_godot_path } from "../utils";
import { OutputChannel } from "vscode";

export { insertOnready };

const insertOnready = async (channel: OutputChannel) => {
  // Get godot path
  const godot_project_path = get_godot_path();
  if (godot_project_path === undefined) {
    channel.appendLine("No godot project set");
    return;
  }
  channel.appendLine(`Godot Project path: ${godot_project_path}`);

  // find and select .tscn files
  const tscn_files = await glob("**/*.tscn", { cwd: godot_project_path });
  const selected = await vscode.window.showQuickPick(tscn_files);
  if (selected === undefined) {
    channel.appendLine("No file selected, aborting");
    return;
  }
  channel.appendLine(`${selected} selected`);

  // build Scenes
  var s = new NodesBuilder(godot_project_path);
  await s.parse(selected);
  const res = await s.get_node_tree();

  // Pick node
  const pick = await vscode.window.showQuickPick(res.choices());
  if (pick === undefined) {
    return;
  }

  let onreadsnip = onready_snippet(pick.node);

  if (
    !vscode.window.activeTextEditor?.document.lineAt(
      vscode.window.activeTextEditor.selection.active
    ).isEmptyOrWhitespace
  ) {
    await vscode.commands.executeCommand("editor.action.insertLineAfter");
  }

  vscode.window.activeTextEditor?.insertSnippet(
    new vscode.SnippetString(onreadsnip.join("\n"))
  );
};
