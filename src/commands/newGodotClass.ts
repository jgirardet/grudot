import { channel } from "diagnostics_channel";
import * as vscode from "vscode";
import { NodeMethodQuickItem } from "../quick_pick_items";
import { node_methods } from "../snippets";

export { newGodotClass };

const newGodotClass = (channel: vscode.OutputChannel) => {};

const prepicked = ["ready", "process"];

const pick_methods = (): Promise<NodeMethodQuickItem[]> => {
  let methods = [];
  for (let k in node_methods) {
    methods.push(
      new NodeMethodQuickItem(k, node_methods[k as string], k in prepicked)
    );
  }
};
