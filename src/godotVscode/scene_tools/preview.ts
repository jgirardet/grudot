import * as fs from "node:fs";
import * as vscode from "vscode";
import {
  type CancellationToken,
  type Event,
  EventEmitter,
  type ExtensionContext,
  type FileDecoration,
  type ProviderResult,
  type TreeDataProvider,
  type TreeDragAndDropController,
  type TreeItem,
  TreeItemCollapsibleState,
  type TreeView,
  Uri,
  window,
  workspace,
} from "vscode";
// import {
// 	convert_resource_path_to_uri,
// 	createLogger,
// 	find_file,
// 	get_configuration,
// 	make_docs_uri,
// 	register_command,
// 	set_context,
// } from "../utils";
import { SceneParser } from "./parser.js";
import type { Scene, SceneNode } from "./types";
import { logger } from "../../log";
import { FullPath, FullPathFile } from "../../types";
import { NAME, REGEX_STRUCT } from "../../constantes";
import path from "node:path";
import { glob } from "glob";
import { getGodotProjectDir } from "../../godotProject.js";

import * as lc from "vscode-languageclient/node";
import Parser from "tree-sitter";
import Rust from "tree-sitter-rust";

const EXTENSION_PREFIX = "godotTools";
const CONTEXT_PREFIX = `${EXTENSION_PREFIX}.context.`;

function set_context(name: string, value: any) {
  return vscode.commands.executeCommand(
    "setContext",
    CONTEXT_PREFIX + name,
    value
  );
}
("godotTools.scenePreview.lockedScene");

export class ScenePreviewProvider
  implements TreeDataProvider<SceneNode>, TreeDragAndDropController<SceneNode>
{
  public dropMimeTypes = [];
  public dragMimeTypes = [];
  private tree: TreeView<SceneNode>;
  private scenePreviewLocked = false;
  private currentScene: FullPathFile = "";
  public parser = new SceneParser();
  public scene?: Scene;
  watcher: vscode.FileSystemWatcher;
  uniqueDecorator = new UniqueDecorationProvider(this);
  scriptDecorator = new ScriptDecorationProvider(this);
  // client: lc.LanguageClient;

  private changeTreeEvent = new EventEmitter<void>();
  public get onDidChangeTreeData(): Event<void> {
    return this.changeTreeEvent.event;
  }

  constructor(private context: ExtensionContext) {
    this.tree = vscode.window.createTreeView("scenePreview", {
      treeDataProvider: this,
      dragAndDropController: this,
    });

    let godotProjectdir = getGodotProjectDir();
    if (!godotProjectdir) {
      throw new Error("Godot project path not set, error starting godot4 rust");
    }
    let p = new vscode.RelativePattern(godotProjectdir, "**/*.tscn");
    this.watcher = workspace.createFileSystemWatcher(p);
    let listen = this.watcher.onDidChange((e) => console.log(`CHANGE : ${e}`));
    let listenc = this.watcher.onDidCreate((e) => console.log(`Crete : ${e}`));
    let listend = this.watcher.onDidDelete((e) => console.log(`delete : ${e}`));

    // let ra = vscode.extensions.getExtension("rust-lang.rust-analyzer");
    // console.log("ra?.exports.client");
    // ra?.activate().then((x) => {
    //   this.client = x?.exports?.client;
    // });
    // console.log("ra?.exports.client");
    // console.log(c.sendRequest());
    // let rap = path.join(ra!.extensionPath, "server", "rust-analyzer");
    // let rapUri = Uri.file(rap);
    // this.client = new lc.LanguageClient(
    //   "rustAnalyzerClient",
    //   {
    //     command: "/home/jim/.cargo/bin/rust-analyzer",
    //   },
    //   { documentSelector: [{ scheme: "file", language: "rust" }] }
    // );

    context.subscriptions.push(
      vscode.commands.registerCommand(
        `${NAME}.scenePreview`,
        this.setPreview.bind(this)
      ),
      // this.watcher.onDidChange(this.on_file_changed.bind(this)),
      window.onDidChangeActiveTextEditor(this.text_editor_changed.bind(this)),
      this.watcher,
      listen,
      listenc,
      listend
      // this.client
    );
  }

  get filePreview(): FullPathFile | undefined {
    return this.context.workspaceState.get(`${NAME}.scenePreview`);
  }

  set filePreview(filename: FullPathFile) {
    this.context.workspaceState.update(`${NAME}.scenePreview`, filename);
  }

  //   register_command("scenePreview.unlock", this.unlock_preview.bind(this)),
  //   register_command(
  //     "scenePreview.copyNodePath",
  //     this.copy_node_path.bind(this)
  //   ),
  //   register_command(
  //     "scenePreview.copyResourcePath",
  //     this.copy_resource_path.bind(this)
  //   ),
  //   register_command("scenePreview.openScene", this.open_scene.bind(this)),
  //   register_command("scenePreview.openScript", this.open_script.bind(this)),
  //   register_command(
  //     "scenePreview.openCurrentScene",
  //     this.open_current_scene.bind(this)
  //   ),
  //   register_command(
  //     "scenePreview.openMainScript",
  //     this.open_main_script.bind(this)
  //   ),
  //   register_command(
  //     "scenePreview.goToDefinition",
  //     this.go_to_definition.bind(this)
  //   ),
  //   register_command(
  //     "scenePreview.openDocumentation",
  //     this.open_documentation.bind(this)
  //   ),
  //   register_command("scenePreview.refresh", this.refresh.bind(this)),
  //   window.onDidChangeActiveTextEditor(this.text_editor_changed.bind(this)),
  //   window.registerFileDecorationProvider(this.uniqueDecorator),
  //   window.registerFileDecorationProvider(this.scriptDecorator),
  //   this.watcher.onDidChange(this.on_file_changed.bind(this)),
  //   this.watcher,
  //   this.tree.onDidChangeSelection(this.tree_selection_changed),
  //   this.tree
  // );
  // const result: string | undefined = this.context.workspaceState.get(
  //   "godotTools.scenePreview.lockedScene"
  // );
  // if (result) {
  //   if (fs.existsSync(result)) {
  //     set_context("scenePreview.locked", true);
  //     this.scenePreviewLocked = true;
  //     this.currentScene = result;
  //   }
  // }

  // this.refresh();
  //   }

  //   setTree(filename: FullPathFile) {
  //     if (result) {
  //       if (fs.existsSync(result)) {
  //         set_context("scenePreview.locked", true);
  //         this.scenePreviewLocked = true;
  //         this.currentScene = result;
  //       }
  //     }
  //   }

  public handleDrag(
    source: readonly SceneNode[],
    data: vscode.DataTransfer,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    data.set("godot/scene", new vscode.DataTransferItem(this.currentScene));
    data.set("godot/node", new vscode.DataTransferItem(source[0]));
    data.set("godot/path", new vscode.DataTransferItem(source[0].path));
    data.set(
      "godot/relativePath",
      new vscode.DataTransferItem(source[0].relativePath)
    );
    data.set("godot/class", new vscode.DataTransferItem(source[0].className));
    data.set("godot/unique", new vscode.DataTransferItem(source[0].unique));
    data.set("godot/label", new vscode.DataTransferItem(source[0].label));
  }

  //   public async on_file_changed(uri: vscode.Uri) {
  //     if (!uri.fsPath.endsWith(".tscn")) {
  //       return;
  //     }
  //     setTimeout(async () => {
  //       if (uri.fsPath === this.currentScene) {
  //         this.refresh();
  //       } else {
  //         const document = await vscode.workspace.openTextDocument(uri);
  //         this.parser.parse_scene(document);
  //       }
  //     }, 20);
  //   }

  public async text_editor_changed() {
    //     if (this.scenePreviewLocked) {
    //       return;
    //     }
    const editor = vscode.window.activeTextEditor;
    console.log("EDITOR changed");
    if (
      !editor
      //  ||
      // editor.document.languageId !== "rust" ||
      // path.extname(editor.document.uri.path) !== ".rs"
    ) {
      return;
    }
    let content = editor.document.getText();
    // let client = new lc.LanguageClient(
    //   "rustAnalyzerClient",
    //   "Rust anallyzer client",
    //   {
    //     command: "/home/jim/.cargo/bin/rust-analyzer",
    //   },
    //   { documentSelector: [{ scheme: "file", language: "rust" }] }
    // );
    // await client.start();;;
    // let ext = await vscode.extensions
    //   .getExtension("rust-lang.rust-analyzer")
    //   ?.activate();
    // let client: lc.LanguageClient = ext.client;
    // console.log(ext);
    // console.log(ext.syntaxTreeProvider);
    // type ViewSyntaxTreeParams = { textDocument: lc.TextDocumentIdentifier };
    // const viewSyntaxTree = new lc.RequestType<
    //   ViewSyntaxTreeParams,
    //   string,
    //   void
    // >("rust-analyzer/viewSyntaxTree");
    // console.log(`CLIENT: ${client.state}`);
    // const syntaxTree: object = await client.sendRequest(
    //   "rust-analyzer/viewSyntaxTree",
    //   { textDocument: { uri: editor.document.uri.toString() }, range: null }
    // );
    // const itemTree = await client.sendRequest("rust-analyzer/viewItemTree", {
    //   textDocument: { uri: editor.document.uri.toString() },
    //   range: null,
    // });
    // console.log(syntaxTree);
    // console.log(itemTree);
    // fs.writeFileSync("/tmp/tree.json", JSON.stringify(syntaxTree));
    //     const Parser = require('tree-sitter');
    // const JavaScript = require('tree-sitter-javascript');

    const parser = new Parser();
    parser.setLanguage(Rust as Parser.Language);

    const pp = (c: Parser.SyntaxNode) => {
      for (const x of c.children) {
        if (c.grammarType === "struct_item") {
          console.log(c.grammarType);
          console.log(c.type);
          let count = 0;
          for (const z of c.children) {
            // console.log(z.type);
            console.log(
              `${count} ${z.grammarType} ${z.grammarId} ${z.text} ${z.type} ${z.typeId}`
            );
            count += 1;
          }
          return;
        } else {
          pp(x);
        }
      }
    };

    const po = (c: Parser.TreeCursor) => {
      while (true) {
        console.log(c.nodeType);
        console.log(c.nodeType);
        if (c.gotoFirstChild()) {
          continue;
        }
        let node = c.currentNode;
        if (c.gotoNextSibling()) {
          continue;
        }
        while (true) {
          if (c.gotoParent()) {
            if (c.gotoNextSibling()) {
              break;
            }
          } else {
            return;
          }
        }
      }
    };

    // const findGodotType = (cursor: Parser.TreeCursor) => {
    //   cursor.gotoFirstChild();
    //   let backup;
    //   while (cursor.gotoNextSibling()) {
    //     if (cursor.nodeType === "struct_item") {
    //       backup = cursor.reset();
    //       console.log(cursor.nodeText);
    //       while (cursor.gotoPreviousSibling()) {
    //         if (cursor.nodeType === "attibute_item") {
    //           console.log(cursor.nodeText);
    //         } else {
    //           console.log("AAAAA");
    //           console.log(cursor.nodeType);
    //         }
    //       }
    //       return;
    //     }
    //   }
    // };
    //   while (true) {
    //     console.log("loopin");
    //     if (cursor.nodeType === "struct_item") {
    //       console.log(cursor.nodeText);
    //       return;

    //       while (cursor.gotoPreviousSibling()) {
    //         if (cursor.nodeType === "attribute_item") {
    //           console.log(cursor.nodeText);
    //           return;
    //         }
    //       }
    //     }
    //   }
    // };

    let tree = parser.parse(content);
    let ro = tree.rootNode;
    // po(ro.walk());
    // findGodotType(ro.walk());
    // console.log(ro.children);
    // console.log(`root ${ro}`);
    // let fc = ro.children.at(5);
    // console.log(fc?.children);

    // console.log(tree.rootNode.toString());

    // console.log(content.match(REGEX_STRUCT)?.at(1));
    // let structName = content.match(REGEX_STRUCT)?.at(1);
    // if (structName === undefined) {
    //   return;
    // }
    // let gdpd = getGodotProjectDir();
    // if (!gdpd) {
    //   return;
    // }

    // let sp = new SceneParser();
    // for (const scene of await glob("**/*.tscn", {
    //   cwd: gdpd,
    //   absolute: true,
    // })) {
    //   // console.log(scene);
    //   let parsed = sp.parse_scene(path.resolve(scene));
    // }
    // let scene = sp.getScene(structName);
    // if (scene) {
    //   console.log(scene.path);
    //   this.setPreview(scene.path);
    // }

    // let ra = vscode.extensions.getExtension("rust-lang.rust-analyzer")?.exports;
    // console.log(ra);
    // console.log(ra.syntaxTreeProvider);
    // console.log(ra.client);
    // console.log(ra.syntaxTreeView);
    // if (!ra) {
    //   logger.error("ra no activated");
    //   return;
    // }
    // logger.info(ra);

    //       const mode = get_configuration("scenePreview.previewRelatedScenes");
    //       // attempt to find related scene
    //       if (!fileName.endsWith(".tscn")) {
    //         const searchName = fileName
    //           .replace(".gd", ".tscn")
    //           .replace(".cs", ".tscn");

    //         if (mode === "anyFolder") {
    //           const relatedScene = await find_file(searchName);
    //           if (!relatedScene) {
    //             return;
    //           }
    //           fileName = relatedScene.fsPath;
    //         }

    //         if (mode === "sameFolder") {
    //           if (fs.existsSync(searchName)) {
    //             fileName = searchName;
    //           } else {
    //             return;
    //           }
    //         }
    //         if (mode === "off") {
    //           return;
    //         }
    //       }
    //       // don't attempt to parse non-scenes
    //       if (!fileName.endsWith(".tscn")) {
    //         return;
    //       }

    //       this.currentScene = fileName;
    //       this.refresh();
    //     }
  }

  public async setPreview(filename?: FullPathFile) {
    if (filename) {
      if (!fs.existsSync(filename)) {
        return;
      }
    }
    console.log("LALAAL");

    // const document = await vscode.workspace.openTextDocument(this.currentScene);
    // this.setPreview(filename);
    // this.setPreview(
    //   "/home/jim/Rien/grudot/assets/GodotProject/Scenes/Main/main.tscn"
    // );
    // filename = "/home/jim/Rien/TestGdextension/Perso.tscn";
    // filename = "/home/jim/Rien/TestGdextension/Monde.tscn";
    // filename =
    //   "/home/jim/Rien/grudot/assets/GodotProject/Scenes/Main/main.tscn";
    this.scene = this.parser.parse_scene(filename!);
    // logger.warn(this.scene);

    if (this.scene) {
      this.tree.message = this.scene.title;
      this.changeTreeEvent.fire();
    }
  }

  //    private lock_preview() {
  //     this.scenePreviewLocked = true;
  //     set_context("scenePreview.locked", true);
  //     this.context.workspaceState.update(
  //       "godotTools.scenePreview.lockedScene",
  //       this.currentScene
  //     );
  //   }

  //   private unlock_preview() {
  //     this.scenePreviewLocked = false;
  //     set_context("scenePreview.locked", false);
  //     this.context.workspaceState.update(
  //       "godotTools.scenePreview.lockedScene",
  //       ""
  //     );
  //     this.refresh();

  //   private copy_node_path(item: SceneNode) {
  //     if (item.unique) {
  //       vscode.env.clipboard.writeText(`%${item.label}`);
  //       return;
  //     }
  //     vscode.env.clipboard.writeText(item.relativePath);
  //   }

  //   private copy_resource_path(item: SceneNode) {
  //     vscode.env.clipboard.writeText(item.resourcePath);
  //   }

  //   private async open_scene(item: SceneNode) {
  //     const uri = await convert_resource_path_to_uri(item.resourcePath);
  //     if (uri) {
  //       vscode.window.showTextDocument(uri, { preview: true });
  //     }
  //   }

  //   private async open_script(item: SceneNode) {
  //     const path = this.scene.externalResources.get(item.scriptId).path;

  //     const uri = await convert_resource_path_to_uri(path);
  //     if (uri) {
  //       vscode.window.showTextDocument(uri, { preview: true });
  //     }
  //   }

  //   private async open_current_scene() {
  //     if (this.currentScene) {
  //       const document = await vscode.workspace.openTextDocument(
  //         this.currentScene
  //       );
  //       vscode.window.showTextDocument(document);
  //     }
  //   }

  //   private async open_main_script() {
  //     if (this.currentScene) {
  //       const root = this.scene.root;
  //       if (root?.hasScript) {
  //         const path = this.scene.externalResources.get(root.scriptId).path;
  //         const uri = await convert_resource_path_to_uri(path);
  //         if (uri) {
  //           vscode.window.showTextDocument(uri, { preview: true });
  //         }
  //       }
  //     }
  //   }

  //   private async go_to_definition(item: SceneNode) {
  //     const document = await vscode.workspace.openTextDocument(this.currentScene);
  //     const start = document.positionAt(item.position);
  //     const end = document.positionAt(item.position + item.text.length);
  //     const range = new vscode.Range(start, end);
  //     vscode.window.showTextDocument(document, { selection: range });
  //   }

  //   private async open_documentation(item: SceneNode) {
  //     vscode.commands.executeCommand(
  //       "vscode.open",
  //       make_docs_uri(item.className)
  //     );
  //   }

  //   private tree_selection_changed(
  //     event: vscode.TreeViewSelectionChangeEvent<SceneNode>
  //   ) {
  //     const item = event.selection[0];
  //     logger.info(item.body);
  //     const editor = vscode.window.activeTextEditor;
  //     const range = editor.document.getText();
  //     editor.revealRange(range);
  //   }

  public getChildren(element?: SceneNode): ProviderResult<SceneNode[]> {
    if (!element) {
      if (!this.scene?.root) {
        return Promise.resolve([]);
      }
      return Promise.resolve([this.scene?.root]);
    }
    return Promise.resolve(element.children);
  }

  public getTreeItem(element: SceneNode): TreeItem | Thenable<TreeItem> {
    if (element.children.length > 0) {
      element.collapsibleState = TreeItemCollapsibleState.Expanded;
    } else {
      element.collapsibleState = TreeItemCollapsibleState.None;
    }

    this.uniqueDecorator.changeDecorationsEvent.fire(element.resourceUri!); //always parsed
    this.scriptDecorator.changeDecorationsEvent.fire(element.resourceUri!);

    return element;
  }
}

class UniqueDecorationProvider implements vscode.FileDecorationProvider {
  public changeDecorationsEvent = new EventEmitter<Uri>();
  get onDidChangeFileDecorations(): Event<Uri> {
    return this.changeDecorationsEvent.event;
  }

  constructor(private previewer: ScenePreviewProvider) {}

  provideFileDecoration(
    uri: Uri,
    token: CancellationToken
  ): FileDecoration | undefined {
    if (uri.scheme !== "godot") return undefined;

    const node = this.previewer.scene?.nodes.get(uri.path);
    if (node?.unique) {
      return {
        badge: "%",
      };
    }
  }
}

class ScriptDecorationProvider implements vscode.FileDecorationProvider {
  public changeDecorationsEvent = new EventEmitter<Uri>();
  get onDidChangeFileDecorations(): Event<Uri> {
    return this.changeDecorationsEvent.event;
  }

  constructor(private previewer: ScenePreviewProvider) {}

  provideFileDecoration(
    uri: Uri,
    token: CancellationToken
  ): FileDecoration | undefined {
    if (uri.scheme !== "godot") {
      return undefined;
    }

    const node = this.previewer.scene?.nodes.get(uri.path);
    if (node?.hasScript) {
      return {
        badge: "S",
      };
    }
  }
}
