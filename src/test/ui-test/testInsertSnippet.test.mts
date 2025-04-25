import { assert } from "chai";
import path from "path";
import * as fs from "fs";
import {
  BottomBarPanel,
  Editor,
  EditorView,
  InputBox,
  TextEditor,
  VSBrowser,
  WebDriver,
  Workbench,
} from "vscode-extension-tester";
import {
  addGodotProjectPathSetting,
  cloneDirToTemp,
  getSettings,
  showOutPanel,
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
    await showOutPanel(driver);
  });

  it("tests one snippet is added to current file", async () => {
    await wb.executeCommand("workbench.action.files.newUntitledFile");
    await wb.executeCommand("godot4-rust.insertOnReady");
    inp = await InputBox.create();
    await inp.selectQuickPick(0);
    await inp.selectQuickPick(4);

    let editor = new TextEditor();
    let ligne1 = await editor.getTextAtLine(1);
    let ligne2 = await editor.getTextAtLine(2);

    assert.equal(ligne1.trim(), '#[init(node = "MC/VB/Label")]');
    assert.equal(ligne2.trim(), "label: OnReady<Gd<Label>>,");
    await wb.executeCommand("godot4-rust.insertOnReady");
    inp = await InputBox.create();
    await inp.selectQuickPick(0);
    await inp.selectQuickPick(4);
    await driver.sleep(2000);
  });
});
