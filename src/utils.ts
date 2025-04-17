import { ConfigurationScope } from "vscode";
import * as vscode from "vscode";
import { GODOT_PROJECT_FILEPATH_KEY, NAME } from "./constantes";
import path from "path";

export { get_godot_path, get_project_config, get_config_value };

const get_godot_path = (): string | undefined => {
  const godotfp = get_config_value(GODOT_PROJECT_FILEPATH_KEY);
  if (godotfp === undefined || godotfp.length === 0) {
    vscode.window.showErrorMessage(
      "Godot Project is not set. Use Ctrl+Maj+P => <Set Godot Project> to select .godot project file"
    );
    return;
  }

  return path.dirname(godotfp!);
};

const get_project_config = (): vscode.WorkspaceConfiguration => {
  return vscode.workspace.getConfiguration(NAME);
};

const get_config_value = (key: string): string | undefined => {
  return get_project_config().get(key);
};

// export { Pos };

// class Pos {
//   _position: Position;
//   constructor(position: Position) {
//     this._position = position;
//   }

//   position = (): Position => this._position;

//   next_line = (): Position => this.next_xline(1);

//   next_xline = (x: number): Position =>
//     new Position(this._position.line + x, this._position.character);

//   add_lines = (x: number) => (this._position = this.next_xline(x));
// }
