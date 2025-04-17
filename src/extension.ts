import { glob } from "glob";
import path from "path";
import * as vscode from "vscode";
import { NodesBuilder } from "./NodesBuilder";
import { onready_snippet } from "./coder";
import { get_godot_path } from "./utils";

export function activate(context: vscode.ExtensionContext) {
  let channel = vscode.window.createOutputChannel("godot4-rust");

  const command_set_project = vscode.commands.registerCommand(
    "godot4-rust.set_godot_project",
    async () => {
      const godotfilepath = await vscode.window.showOpenDialog({
        filters: { "Godot Project File": ["godot"] },
        openLabel: "Select .godot project file",
        canSelectFiles: true,
      });
      if (godotfilepath === undefined) {
        channel.appendLine("Godot4-Rust: Non project File selected");
        return;
      }
      vscode.workspace
        .getConfiguration("godot4-rust")
        .update("godotProjectFilePath", godotfilepath[0].fsPath);
    }
  );

  const command_onready = vscode.commands.registerCommand(
    "godot4-rust.insert_onready",
    async () => {
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
      console.log(res);

      const onready = await vscode.window.showQuickPick(res.choices());
      console.log(onready);

      let a = "1";
      let b = Number.parseInt(a);

      const scene = res.nodes[Number.parseInt(onready!.split(" ")[0])];

      let pos = vscode.window.activeTextEditor!.selection.active;
      let onreadsnip = onready_snippet(scene);

      if (
        !vscode.window.activeTextEditor?.document.lineAt(pos)
          .isEmptyOrWhitespace
      ) {
        await vscode.commands.executeCommand("editor.action.insertLineAfter");
      }

      vscode.window.activeTextEditor?.insertSnippet(
        new vscode.SnippetString(onreadsnip.join("\n"))
      );

      // await write(pos, onreadsnip[0]);
      // await write(
      //   new vscode.Position(pos!.line + 1, pos!.character),
      //   " ".repeat(pos.character) + onreadsnip[1]
      // );

      // editBuilder.insert(pos!, onreadsnip[0]);
      // editBuilder.insert(
      //   new vscode.Position(pos!.line + 1, pos!.character),
      //   ""
      // );
      // editBuilder.insert(
      //   new vscode.Position(pos!.line + 2, pos!.character),
      //   onreadsnip[1]
      // );
    }
  );

  // console.log("aa", await get_scene_tree(r));

  context.subscriptions.push(command_onready);
}

// This method is called when your extension is deactivated
export function deactivate() {}
