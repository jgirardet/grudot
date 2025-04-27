import path from "path";
import { logger } from "../log";
import { Uri, window } from "vscode";
import { selectGodotProject } from "./setGodotProject";
import { FullPath, FullPathDir, FullPathFile, Name } from "../types";
import { getParsedGodotProject } from "../godotProject";
import { kebabCase } from "string-ts";
import { runCargoCommand } from "../cargo";
import { match, P } from "ts-pattern";
import { error } from "console";

export const startNewExtensionCommand = async () => {
  logger.info("Starting new extension");

  let a = match(await runCargoCommand("search godot -q --limit 1"))
    .with({ ok: P._ }, (out) => {
      let res =
        out.ok.split("\n")[0].match(/godot\s=\s\"\d\.\d\.\d\"/)?.[0] ??
        'godot = "0.2.4"';
      logger.info(`Using godot crate : ${res}`);
      return res;
    })
    .with({ error: P._ }, (err) => {
      logger.warn(
        `Cargo command returned ${err.error}. Falling back to "cargo = 0.2.4" in Cargo.toml`
      );
      return "godot = 0.2.4";
    });

  return;
  const godotFileProject = await selectGodotProjectStep();
  if (godotFileProject === undefined) {
    logger.warn("Aborting");
    return;
  }
  const crateName = await writeCrateNameStep(godotFileProject);
  if (crateName === undefined) {
    logger.warn("Aborting");
    return;
  }
  const rustParentDir = await selecRustParentDirStep(
    path.dirname(godotFileProject)
  );
  if (rustParentDir === undefined) {
    logger.warn("Aborting");
    return;
  }

  const gd = new NewGDExtension(godotFileProject, rustParentDir, crateName);
  await gd.run();
};

class NewGDExtension {
  // project.godot path
  _godotProjectFile: FullPathFile;

  // Directory which will contains rustDir
  _rustDirBase: FullPathDir;

  // crate name
  _crateName: Name;

  // godot project directory
  public get godotDir(): FullPathDir {
    return path.dirname(this._godotProjectFile);
  }

  // godot.project path
  public get godotProjectFile(): FullPathFile {
    return this._godotProjectFile;
  }

  constructor(
    godotProject: FullPathFile,
    rustDirBase: FullPathDir,
    crateName: Name
  ) {
    this._godotProjectFile = godotProject;
    this._rustDirBase = rustDirBase;
    this._crateName = crateName;
    window.showQuickPick;
  }

  run = async () => {
    // create rust dir
    //
  };
}

const validateCrateName = (name: string): boolean => {
  if (/[^a-z|-|_|0-9]/.test(name)) {
    return false;
  }
  if (name.includes("-") && name.includes("_")) {
    return false;
  }
  return true;
};

const selectGodotProjectStep = async (): Promise<FullPathFile | undefined> => {
  let res = await selectGodotProject();
  logger.info(`Trying to create project from: ${res}`);
  return res;
};

const writeCrateNameStep = async (
  godotProject: FullPathFile
): Promise<Name | undefined> => {
  let value: string = kebabCase(getParsedGodotProject().name);
  while (true) {
    let name = await window.showInputBox({
      placeHolder: "crate name",
      title: "Enter a crate name",
      prompt: "Crate name must be snake_case or kebab-case",
      value: value,
    });
    if (name === undefined) {
      return;
    }
    if (validateCrateName(name)) {
      logger.info(`New crate name selected: ${name}`);
      return name;
    } else {
      value = name;
    }
  }
};

const selecRustParentDirStep = async (
  godotProject: FullPathDir
): Promise<FullPathDir | undefined> => {
  let res = await window.showOpenDialog({
    canSelectFolders: true,
    canSelectFiles: false,
    canSelectMany: false,
    defaultUri: Uri.file(godotProject),
    openLabel: "Choose",
    title: "Select parent folder of the new generated crate",
  });
  if (res !== undefined) {
    logger.info(`New Rust crate will created inside ${res[0].path}`);
    return res[0].path;
  }
};

const buildCargoToml = (crateName: Name): string => `[package]
name = "${crateName}"
version = "0.1.0"
edition = "2024"

[lib]
crate-type = ["cdylib"]

[dependencies]
godot = "0.2.4"`;
