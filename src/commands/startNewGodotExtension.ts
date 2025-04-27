import path from "path";
import { logger } from "../log";
import {
  IconPath,
  QuickInputButton,
  QuickPickItem,
  QuickPickItemKind,
  window,
} from "vscode";

const startNewExtensionCommand = async () => {
  logger.info("Starting new extension");
};

class NewExtension {
  // project.godot path
  _godotProject: string;

  // Directory which will contains rustDir
  _rustDirBase: string;

  // crate name
  _crateName: string;

  // godot project directory
  public get godotDir(): string {
    return path.dirname(this._godotProject);
  }

  // godot.project path
  public get godotProject(): string {
    return this._godotProject;
  }

  constructor(godotProject: string, rustDirBase: string, crateName: string) {
    this._godotProject = godotProject;
    this._rustDirBase = rustDirBase;
    this._crateName = crateName;
    window.showQuickPick;
  }
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

type FullPathDir = string;
type FullPathFile = string;
type FullPath = FullPathDir | FullPathFile;
type Name = string;
type MultiStepResult = FullPath | Name;
type StepResult =


// const runSteps = async () => {
//     Path
// };

// class MultiStepItem<T> implements QuickPickItem {
//   label: string;
//   step: number;
//   totalStep: number;

//   description: string;
//   detail: string;
//   picked?: boolean | undefined;
//   alwaysShow?: boolean | undefined;
//   buttons?: readonly QuickInputButton[] | undefined;

//   constructor(label: string, step: number, totalStep: )
//   window.showQuickPick
// }
