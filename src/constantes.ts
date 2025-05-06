export const NAME = "godot4-rust";
export const DISPLAY_NAME = "Godot4 Rust";
export const GODOT_PROJECT_FILEPATH_KEY = "godotProjectFilePath";
export const PUBLISHER = "aaaaa";
export const EXTENSION_ID = `${PUBLISHER}.${NAME}`;

export interface GodotSettings {
  "godot4-rust.godotProjectFilePath": string;
}

export const LAST_GODOT_CRATE_VERSION_AS_TOML: string = 'godot = "0.2.4"';

export const REGEX_STRUCT =
  // /(?:^#\[derive\(GodotClass\)\]$)(?:\n#\[.+\]|\n\/{2,3}.*)*\n^struct (\w+)/m;
  // /(?:^#\[derive\(GodotClass\)\]$)(?:\n#\[.+\]|\n\/{2,3}.*)*\n^(?:pub )?struct (\w+)/m;
  /(?:^#\[derive\(GodotClass\)\]$)(?:\n#\[.+\]|\n\/{2,3}.*)*\n^(?:pub(?:\(crate\))? )?struct (\w+)/m;
