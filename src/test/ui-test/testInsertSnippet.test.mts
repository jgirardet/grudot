import { assert } from "chai";
import path from "path";
import * as fs from "fs";
import {
  BottomBarPanel,
  InputBox,
  VSBrowser,
  WebDriver,
  Workbench,
} from "vscode-extension-tester";
import {
  addGodotProjectPathSetting,
  cloneDirToTemp,
  getSettings,
} from "../testutils.js";

describe("InsertSnippet Command", () => {
  let browser: VSBrowser;
  let driver: WebDriver;
  let wb: Workbench;
  let rootPath: string;
  let inp: InputBox;

  beforeEach(async () => {
    rootPath = cloneDirToTemp("assets/noConfigProject");
    addGodotProjectPathSetting(rootPath);
    browser = VSBrowser.instance;
    browser.openResources(rootPath);
    driver = browser.driver;
    await browser.waitForWorkbench();
    wb = new Workbench();
  });

  it("tests one snippet is added to current file", async () => {
    // await wb.executeCommand("workbench.action.files.newUntitledFile");
    // inp = await InputBox.create();
    // await inp.confirm();

    const bottomBar = new BottomBarPanel();
    await bottomBar.toggle(true);
    const outputView = await bottomBar.openOutputView();
    await outputView.selectChannel("Godot4 Rust");
    await wb.executeCommand("godot4-rust.insertOnReady");

    // await wb.openCommandPrompt();
    // await inp.setText("Ouput:");
    // await driver.sleep(2000);
    // await inp.confirm();
    // await inp.setText("Godot4");
    // await driver.sleep(2000);
    // await inp.confirm();

    // await inp.confirm();
    // await inp.selectQuickPick(0);
    // await inp.selectQuickPick(2);
    await driver.sleep(5000);
    throw new Error("irne");
  });
});
