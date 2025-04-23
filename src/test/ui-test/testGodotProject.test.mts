import { assert } from "chai";
import path from "path";
import * as fs from "fs";
// import the webdriver and the high level browser wrapper
import {
  InputBox,
  ReleaseQuality,
  VSBrowser,
  WebDriver,
  Workbench,
} from "vscode-extension-tester";
import { cloneDirToTemp, getSettings } from "../testutils.js";

// Create a Mocha suite
describe("UI Godot4-rust test suite", () => {
  let browser: VSBrowser;
  let driver: WebDriver;
  let wb: Workbench;
  let rootPath: string;
  let tempPaths: string[] = [];
  // initialize the browser and webdriver
  // before(async () => { });

  beforeEach(async () => {
    rootPath = cloneDirToTemp("assets/sample1");
    tempPaths.push(rootPath);
    browser = VSBrowser.instance;
    browser.openResources(rootPath);
    driver = browser.driver;
    await browser.waitForWorkbench();
    wb = new Workbench();
  });

  afterEach(async () => {
    // await driver.close();
    // fs.rmdirSync(rootPath, { recursive: true });
  });

  after(async () => {
    // await driver.close();
    // for (const p of tempPaths) {
    //   fs.rmdirSync(rootPath, { recursive: true });
    // }
  });

  it("Test Godot set project", async () => {
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

    // await browser.openResources(path.resolve(rootPath));
    await wb.executeCommand("godto4-rust.setGodotProject");
    let inp = await InputBox.create();
    await inp.confirm();
    await inp.setText(godotProjectFilePath);
    await inp.confirm();

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
