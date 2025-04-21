import * as vscode from "vscode";
import { NodeMethodQuickItem } from "../tscn/quickPickItems";
import {
  classImports,
  declGodotClassEnd,
  declGodotClassStart,
  implVirtualMethodsEnd,
  implVirtualMethodsStart,
  node_methods,
  onready_snippet,
} from "../snippets";
import { logger } from "../log";
import { Node, Nodes, NodesBuilder } from "../tscn/NodesBuilder";
import { GODOT_CLASSES } from "../godotClasses";
import { getDotGodotPath, selectTscn } from "../utils";
import path from "path";
import { toSnake } from "ts-case-convert";

export { newGodotClass };

const newGodotClass = async () => {
  const godotProjectPath = getDotGodotPath();
  const selectedTscn = await selectTscn(godotProjectPath);
  if (selectedTscn === undefined) {
    return;
  }

  const nodes = await NodesBuilder.build(godotProjectPath, selectedTscn);
  if (nodes === undefined) {
    logger.info("New Godot Class command: aborting");
    return;
  }

  const methods = buildMethodsList();
  const pickedMethod = await pickMethods(methods);
  if (pickedMethod === undefined) {
    logger.info("New Godot Class command: aborting");
    return;
  }
  const pickedOnready = await pickOnReady(nodes);
  if (pickedOnready === undefined) {
    logger.info("New Godot Class command: aborting");
    return;
  }

  const snippet = build_snippet(nodes.nodes[0], pickedMethod, pickedOnready);
  const a = await vscode.window.activeTextEditor?.insertSnippet(
    new vscode.SnippetString(snippet)
  );
  await vscode.commands.executeCommand("editor.action.formatDocument");
  // doesnt work if run once
  await vscode.commands.executeCommand("editor.action.formatDocument");
};

const prepicked = ["ready", "process"];

const buildMethodsList = (): NodeMethodQuickItem[] => {
  let methods = [];
  for (let [name, imp] of Object.entries(node_methods)) {
    methods.push(new NodeMethodQuickItem(name, imp, prepicked.includes(name)));
  }
  return methods;
};

const pickMethods = async (
  mets: NodeMethodQuickItem[]
): Promise<NodeMethodQuickItem[] | undefined> => {
  let choices = await vscode.window.showQuickPick(mets, {
    canPickMany: true,
    title: "Select Tscn to derive from",
  });
  return choices;
};

const pickOnReady = async (nodes: Nodes): Promise<Node[] | undefined> => {
  let choices = await vscode.window.showQuickPick(nodes.choices(), {
    canPickMany: true,
    title: "Select OnReady field to add",
  });
  if (choices === undefined) {
    return undefined;
  }

  return choices.map((p) => {
    return p.node;
  });
};

const build_snippet = (
  node: Node,
  methods: NodeMethodQuickItem[],
  onReadys: Node[]
): string => {
  const onreadysImports = onReadys
    .filter((p) => GODOT_CLASSES.includes(p.type))
    .map((p) => p.type);
  const cImports = classImports(node, onreadysImports);
  const decl_start = declGodotClassStart(node);
  const decl_end = declGodotClassEnd();
  const imp_start = implVirtualMethodsStart(node);
  const impl_end = implVirtualMethodsEnd();

  const virMethods = methods.map((x) => x.detail);

  const onreadysFields = onReadys.map((p) => onready_snippet(p).join("\n"));

  return cImports
    .concat(
      decl_start,
      onreadysFields,
      decl_end,
      imp_start,
      virMethods,
      impl_end
    )
    .join("\n");
};

const persist = async (selectedTscn: string) => {
  let filename = await vscode.window.showSaveDialog({
    saveLabel: path.basename(selectedTscn),
  });
  if (filename === undefined) {
    return;
  }
  let newFileName = toSnake(filename.fsPath);
};
