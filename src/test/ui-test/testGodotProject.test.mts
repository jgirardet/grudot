import { assert } from "chai";
import path from "path";
import * as fs from "fs";
import {
  InputBox,
  VSBrowser,
  WebDriver,
  Workbench,
} from "vscode-extension-tester";
import { cloneDirToTemp, getSettings } from "../testutils.js";

describe("UI Godot4-rust test suite", () => {
  let browser: VSBrowser;
  let driver: WebDriver;
  let wb: Workbench;
  let rootPath: string;

  beforeEach(async () => {
    rootPath = cloneDirToTemp("assets/noConfigProject");
    browser = VSBrowser.instance;
    browser.openResources(rootPath);
    driver = browser.driver;
    await browser.waitForWorkbench();
    wb = new Workbench();
  });

  it("Test Godot set project command add configs to workspace", async () => {
    let settingsFile = path.resolve(rootPath, ".vscode/settings.json");
    let godotProjectFilePath = path.resolve(
      "assets/GodotProject/project.godot"
    );

    if (fs.existsSync(settingsFile)) {
      fs.rmSync(settingsFile);
    }

    assert(
      getSettings(settingsFile) === undefined,
      "Attention settings exists"
    );

    await wb.executeCommand("godto4-rust.setGodotProject");
    let inp = await InputBox.create();
    await inp.confirm();
    await inp.setText(godotProjectFilePath);
    await inp.confirm();
    await driver.sleep(1000); // let it
    assert(fs.existsSync(settingsFile), `${settingsFile} devraient être créé`);

    let configPath =
      getSettings(settingsFile)?.["godot4-rust.godotProjectFilePath"];
    assert.equal(
      configPath!.toLowerCase(),
      godotProjectFilePath.toLowerCase(),
      "Les chemins ne sont pas les mêmes"
    );
  });
});
