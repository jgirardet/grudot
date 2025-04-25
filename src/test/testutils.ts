import path from "path";
import { GODOT_PROJECT_FILEPATH_KEY, GodotSettings, NAME } from "../constantes";
import * as fs from "fs";
import * as os from "os";
import { glob } from "glob";
import { fileURLToPath, pathToFileURL } from "url";
import {
  BottomBarPanel,
  OutputView,
  until,
  VSBrowser,
  WebDriver,
  WebElementCondition,
  Workbench,
} from "vscode-extension-tester";

export const cloneDirToTemp = (dirpath: string): string => {
  let tmp = fs.mkdtempSync(path.join(os.tmpdir(), "grudot"));
  console.log(`using tmp dur ${tmp}`);
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
  console.log(setting);
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

export const showOutPanel = async (driver: WebDriver): Promise<OutputView> => {
  // await wait(1000);
  // driver.wait("a" === "a");

  const bottomBar = new BottomBarPanel();
  await bottomBar.toggle(true);
  console.log("TOGGLE");
  const outputView = await bottomBar.openOutputView();
  console.log("TOGGLE");
  // driver.wait)
  while (true) {
    const names = await outputView.getChannelNames();
    if ("Godot4 Rust" in names) {
      await outputView.selectChannel("Godot4 Rust");
      return outputView;
    } else {
      await driver.sleep(100);
    }
  }
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

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const clearTmp = async () => {
  for (let d of await glob(`${os.tmpdir()}/grudot*`)) {
    fs.rmSync(d, { recursive: true, force: true });
  }
};

clearTmp();
