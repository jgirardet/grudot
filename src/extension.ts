import { glob } from "glob";
import path from "path";
import * as vscode from "vscode";
import { SceneBuilder } from "./SceneBuilder";
import { onready_snippet } from "./coder";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "grudot" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "grudot.helloWorld",
    async () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      const options: vscode.OpenDialogOptions = {
        filters: { "Fichiers Godot": ["godot"] },
        openLabel: "Ouvrir le fichier projet .godot",
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
      };
      console.log("mais alors");
      // const f = await vscode.window.showOpenDialog(options).then((u) => u);

      // console.log("efefz");
      // const rep = f![0];
      // console.log(rep);
      // const r = "/home/jim/dev/godot/Sokoban/";
      const r = "/home/jim/dev/godot/Sokoban/Scenes/Main/main.tscn";
      // const files = await glob("**/*.tscn", { cwd: r });
      // console.log(files);
      // const selected = await vscode.window.showQuickPick(files).then((x) => x);
      // console.log(selected);
      const godot_p = "/home/jim/dev/godot/Sokoban/project.godot";
      var s = new SceneBuilder(godot_p);
      await s.parse(r);
      const res = await s.get_scene_tree();
      console.log(res);

      const onready = await vscode.window.showQuickPick(res.choices());
      console.log(onready);

      let a = "1";
      let b = Number.parseInt(a);

      const scene = res.scenes[Number.parseInt(onready!.split(" ")[0])];

      let pos = vscode.window.activeTextEditor!.selection.active;
      let onreadsnip = onready_snippet(scene);

      const write = async (pos: vscode.Position, text: string) => {
        await vscode.window.activeTextEditor?.edit((editBuilder) => {
          editBuilder.insert(pos, text);
        });
      };
      if (
        vscode.window.activeTextEditor?.document.getText(
          new vscode.Range(
            new vscode.Position(pos.line, 0),
            new vscode.Position(pos.line, 1000)
          )
        )
      ) {
        await write();
      }

      await write(pos, onreadsnip[0]);
      await write(
        new vscode.Position(pos!.line + 1, pos!.character),
        " ".repeat(pos.character) + onreadsnip[1]
      );

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

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
