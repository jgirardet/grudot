import { assert } from "chai";
import path from "path";
import * as fs from "fs";
import {
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

  beforeEach(async () => {
    rootPath = cloneDirToTemp("assets/noConfigProject");
    browser = VSBrowser.instance;
    browser.openResources(rootPath);
    driver = browser.driver;
    await browser.waitForWorkbench();
    wb = new Workbench();
    addGodotProjectPathSetting(rootPath);
  });

  it("tests one snippet is added to current file", async () => {
    await wb.executeCommand("workbench.action.files.newUntitledFile");
    await wb.executeCommand("godot4-rust.insertOnReady");
  });
});
