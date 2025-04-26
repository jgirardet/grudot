import { glob } from "glob";
import { GODOT_PROJECT_FILEPATH_KEY } from "../constantes";
import { getConfigValue, getRustDir } from "../utils";
import path from "path";
import { commands, Uri, window, workspace } from "vscode";
import { logger } from "../log";
import { readFile } from "fs/promises";
import * as ini from "ini";
import { log } from "console";

export const createGdextensionCommand = async () => {
  logger.info("Starting command: create gdextension file");
  const rustDir = await getRustDir();
  const godotDir = path.dirname(getConfigValue(GODOT_PROJECT_FILEPATH_KEY));
  logger.info(`Using ${godotDir}`);
  const content = await gdText(rustDir);
  // let cargo path.join()
};

const gdText = async (rustDir: string, version?: string) => {
  const godotFile = getConfigValue(GODOT_PROJECT_FILEPATH_KEY);
  let _version;
  if (version === undefined) {
    let text = await readFile(godotFile, {
      encoding: "utf-8",
    });
    let project = ini.parse(text);
    console.log(project);
    _version =
      (project["application"]["config/features"] as string)
        .match(/.*(\d\.\d).*/)
        ?.at(1) ?? "4.2";
  } else {
    _version = version;
  }
  logger.info(`Creating gdextension file with compatibility ${_version}`);
  const relativeRustDir = path.relative(rustDir, godotFile);

  return `
[configuration]
entry_symbol = "gdext_rust_init"
compatibility_minimum = ${_version}
reloadable = true

[libraries]
linux.debug.x86_64 =     "res://${relativeRustDir}/target/debug/lib{YourCrate}.so"
linux.release.x86_64 =   "res://${relativeRustDir}/target/release/lib{YourCrate}.so"
windows.debug.x86_64 =   "res://${relativeRustDir}/target/debug/{YourCrate}.dll"
windows.release.x86_64 = "res://${relativeRustDir}/target/release/{YourCrate}.dll"
macos.debug =            "res://${relativeRustDir}/target/debug/lib{YourCrate}.dylib"
macos.release =          "res://${relativeRustDir}/target/release/lib{YourCrate}.dylib"
macos.debug.arm64 =      "res://${relativeRustDir}/target/debug/lib{YourCrate}.dylib"
macos.release.arm64 =    "res://${relativeRustDir}/target/release/lib{YourCrate}.dylib"
`;
};

//   const files = await glob("*.gdextension", { cwd: godotDir, absolute: true });
//   if (files.length === 1) {
//     if (!(await alreadyContainsOneGdextention(files[0]))) {
//       return;
//     }
//   } else if (files.length > 1) {
//     throw new Error("")
//   }
// };

// /// Return true to create new one
// const alreadyContainsOneGdextention = async (
//   fullPath: string
// ): Promise<boolean> => {
//   let basename = path.basename(fullPath);
//   let godotDir = path.dirname(fullPath);
//   const newOneText = "Create a new one";
//   const changePathText = "Change Godot Project Path";
//   let resp = await window.showInformationMessage(
//     `The folder ${godotDir} already contains \"${basename}\". What should be done ?`,
//     { modal: true },
//     newOneText,
//     changePathText
//   );

//   if (resp === newOneText) {
//     await workspace.fs.delete(Uri.file(fullPath));
//     logger.info(`${fullPath}" has been deleted`);
//     return true;
//   } else if (resp === changePathText) {
//     commands.executeCommand("godot4-rust.setGodotProject");
//     return false;
//   } else {
//     logger.info(`Command cancelled`);
//     return false;
//   }
// };
