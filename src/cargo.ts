import { existsSync, readFileSync, readSync } from "fs";
import path from "path";
import * as vscode from "vscode";
import { logger } from "./log";
const toml = require("smol-toml");
// import * as cp from "child_process";
import util from "node:util";
import cp from "node:child_process";
const exec = util.promisify(cp.exec);

// find Cargo.toml file => undefined if != 1
export const getCargoToml = async (): Promise<string | undefined> => {
  let cargo = await vscode.workspace.findFiles("Cargo.toml");
  if (cargo.length === 1) {
    return path.resolve(cargo[0].fsPath);
  }
};

export const getRustDir = async (cargoToml?: string): Promise<string> => {
  if (cargoToml !== undefined) {
    return path.resolve(path.dirname(cargoToml));
  }
  let cargo = await getCargoToml();
  if (cargo !== undefined) {
    return path.resolve(path.dirname(cargo));
  } else {
    let folders = vscode.workspace.workspaceFolders;
    if (folders !== undefined && folders.length > 0) {
      return folders.at(0)!.uri.path;
    } else {
      throw new Error("Can't find any Cargo.toml ? Is the workspace opened ?");
    }
  }
};

/// Try to return rust/src/ folder and fallback workspace
export const getRustSrcDir = async (cargoToml?: string): Promise<string> => {
  let rustDir = await getRustDir(cargoToml);
  if (existsSync(path.join(rustDir, "src/"))) {
    let joined = path.resolve(path.join(rustDir, "src/"));
    return joined;
  } else {
    return rustDir;
  }
};

export const getCrateName = (cargoPath: string): string => {
  let file = readFileSync(cargoPath).toString("utf-8");
  let content = toml.parse(file);
  let res = content.package?.name;
  logger.info(`crate name: ${res}`);
  if (res === undefined) {
    throw new Error(
      "There is a probleme with Cargo.toml, Can't find crate's name"
    );
  }
  return res;
};

type CargoComandResult = CargoError | CargoSucces;

interface CargoError {
  error: string;
}

interface CargoSucces {
  ok: string;
}

export const runCargoCommand = async (
  command: string
): Promise<CargoComandResult> => {
  let out: string;
  let err: string;

  try {
    const { stdout, stderr } = await exec(`cargo ${command}`);
    out = stdout;
    err = stderr;
  } catch (e) {
    console.log(e);
    return {error:e}
  } finally {
    if (err.length > 0) {
      return { error: stderr };
    } else {
      return { ok: stdout };
    }
  }
};
