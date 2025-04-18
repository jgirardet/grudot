import { glob } from "glob";
import * as vscode from "vscode";
import { NodesBuilder } from "../NodesBuilder";
import { onready_snippet } from "../snippets";
import { get_godot_path, select_tscn } from "../utils";
import { logger } from "../log";

export { insertOnready };

const insertOnready = async () => {
  // select a .tscn file in project
  const godot_project_path = get_godot_path();
  const selected = await select_tscn(godot_project_path);
  if (selected === undefined) {
    return;
  }

  // build nodes
  var s = new NodesBuilder(godot_project_path);
  await s.parse(selected);
  const res = await s.get_node_tree();

  // Pick node
  const pick = await vscode.window.showQuickPick(res.choices());
  if (pick === undefined) {
    return;
  }
  logger.info(`Node selected: \"${pick.node.path}\"`);
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
