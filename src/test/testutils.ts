import path from "path";
import { GodotSettings } from "../constantes";
import * as fs from "fs";
import * as os from "os";
import { glob } from "glob";
import {
  BottomBarPanel,
  InputBox,
  OutputView,
  VSBrowser,
  WebDriver,
  Workbench,
} from "vscode-extension-tester";

export const cloneDirToTemp = (dirpath: string): string => {
  let tmp = fs.mkdtempSync(path.join(os.tmpdir(), "grudot"));
  fs.cpSync(dirpath, tmp, { recursive: true });
  return tmp;
};

export const addGodotProjectPathSetting = (projectPath: string) => {
  let dotvscode = path.resolve(projectPath, ".vscode");
  let godotProject = path.resolve("assets/GodotProject/project.godot");
  fs.mkdirSync(dotvscode);
  console.log(`Using: ${dotvscode} existing ${fs.existsSync(dotvscode)}`);
  let setting = {
    "godot4-rust.godotProjectFilePath": godotProject,
  };
  fs.writeFileSync(
    path.resolve(projectPath, ".vscode/settings.json"),
    JSON.stringify(setting)
  );
};

export const getSettings = (filepath: string): GodotSettings | undefined => {
  if (fs.existsSync(filepath)) {
    let settings: GodotSettings = JSON.parse(
      fs.readFileSync(filepath, {
        encoding: "utf-8",
      })
    );
    return settings;
  }
  return undefined;
};

export const initTest = async (): Promise<
  [string, VSBrowser, WebDriver, Workbench, BottomBarPanel, OutputView]
> => {
  let rootPath = cloneDirToTemp("assets/noConfigProject");
  addGodotProjectPathSetting(rootPath);
  let browser = VSBrowser.instance;
  browser.openResources(rootPath);
  let driver = browser.driver;
  await browser.waitForWorkbench();
  let wb = new Workbench();
  let bottomBar = new BottomBarPanel();
  await browser.waitForWorkbench(500);
  await bottomBar.toggle(true);
  let outputView = await bottomBar.openOutputView();
  await browser.waitForWorkbench(5000);
  await outputView.selectChannel("Godot4 Rust");
  await browser.waitForWorkbench(500);
  return [rootPath, browser, driver, wb, bottomBar, outputView];
};

export const multiSelect = async (
  inp: InputBox,
  idxOrNames: string[] | number[]
) => {
  if (idxOrNames.length === 0) {
    throw new Error("Multiselect must not be empty");
  }
  let boxes = await inp.getCheckboxes();
  for (let b of boxes) {
    let checked = await b.isSelected();
    let toCheck: boolean;
    if (typeof idxOrNames[0] === "string") {
      toCheck = (idxOrNames as string[]).includes(await b.getLabel());
    } else {
      toCheck = (idxOrNames as number[]).includes(b.getIndex());
    }
    if (checked !== toCheck) {
      await b.click();
    }
  }
};

const clearTmp = async () => {
  for (let d of await glob(`${os.tmpdir()}/grudot*`)) {
    fs.rmSync(d, { recursive: true, force: true });
  }
};

clearTmp();
