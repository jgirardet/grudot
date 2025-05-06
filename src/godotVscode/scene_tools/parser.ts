import * as fs from "node:fs";
import path, { basename, extname } from "node:path";
import { Uri } from "vscode";
import { SceneNode, Scene, GDResource } from "./types.js";
import { FullPathDir, FullPathFile } from "../../types.js";
import indexToPosition from "../../indexToPosition/index.js";
import { glob, globSync } from "glob";

const EMPTY = "¨23LF¨23F"; // used to mimic null Gderesource

export class SceneParser {
  private static instance: SceneParser;
  public scenes: Map<string, Scene> = new Map();

  constructor() {
    if (SceneParser.instance) {
      // biome-ignore lint/correctness/noConstructorReturn: <explanation>
      return SceneParser.instance;
    }
    SceneParser.instance = this;
  }

  parseDir(dirPath: FullPathDir): Map<string, Scene> {
    if (!fs.existsSync(dirPath)) {
      throw new Error(`Can't parse directoy ${dirPath}, Doesn't exists`);
    }
    for (const scene of globSync("**/*.tscn", {
      cwd: dirPath,
      absolute: true,
    })) {
      SceneParser.instance.parse_scene(path.resolve(scene));
    }
    return this.scenes;
  }

  reset(path: FullPathDir) {
    this.scenes.clear();
    
  }

  public parse_scene(path: FullPathFile): Scene {
    const stats = fs.statSync(path);

    if (this.scenes.has(path)) {
      const scene = this.scenes.get(path);

      if (scene?.mtime === stats.mtimeMs) {
        return scene;
      }
    }

    const scene = new Scene(path, basename(path), stats.mtimeMs);
    // scene.path = path;
    // scene.mtime = stats.mtimeMs;
    // scene.title = basename(path);

    this.scenes.set(path, scene);

    const text = fs.readFileSync(path, { encoding: "utf-8" });

    for (const match of text.matchAll(/\[ext_resource.*/g)) {
      const line = match[0];
      const type = line.match(/type="([\w]+)"/)?.[1];
      const path = line.match(/path="([\w.:\/-]+)"/)?.[1];
      const uid = line.match(/uid="([\w:/]+)"/)?.[1];
      const id = line.match(/ id="?([\w]+)"?/)?.[1];

      if (
        line === undefined ||
        path === undefined ||
        type === undefined ||
        // uid === undefined ||
        id === undefined
      ) {
        throw new Error(`Fail to parse ext_resource ${scene.path}, parsed:
line: ${line}
path: ${path}
type: ${type}
id: ${id}
uid: ${uid}`);
      }
      scene.externalResources.set(id, {
        body: line,
        path: path,
        type: type,
        uid: uid,
        id: id,
        index: match.index,
        line: indexToPosition(text, match.index).line,
        // line: document.lineAt(document.positionAt(match.index)).lineNumber + 1,
      });
    }

    let lastResource: GDResource = {
      id: EMPTY,
      index: 0,
      line: 0,
      path: "",
      type: "",
      uid: "0",
    };
    // let firstPass = true;
    for (const match of text.matchAll(/\[sub_resource.*/g)) {
      const line = match[0];
      const type = line.match(/type="([\w]+)"/)?.[1];
      const path = line.match(/path="([\w.:/]+)"/)?.[1];
      const uid = line.match(/uid="([\w:/]+)"/)?.[1];
      const id = line.match(/ id="?([\w]+)"?/)?.[1];
      if (
        line === undefined ||
        // path === undefined ||
        type === undefined ||
        // uid === undefined ||
        id === undefined
      ) {
        throw new Error(`Fail to parse resource ${scene.path}`);
      }
      const resource: GDResource = {
        path: path,
        type: type,
        uid: uid,
        id: id,
        index: match.index,
        // line: document.lineAt(document.positionAt(match.index)).lineNumber + 1,
        line: indexToPosition(text, match.index).line,
      };

      if (lastResource.id !== EMPTY) {
        lastResource.body = text
          .slice(lastResource!.index, match.index)
          .trimEnd();
      }
      scene.subResources.set(id, resource);
      lastResource = resource;
    }

    let root = "";
    const nodes: Map<string, SceneNode> = new Map();
    let lastNode = null;

    const nodeRegex = /\[node.*/g;
    for (const match of text.matchAll(nodeRegex)) {
      const line = match[0];
      const name = line.match(/name="([^.:@/"%]+)"/)?.[1];
      const type = line.match(/type="([\w]+)"/)?.[1] ?? "PackedScene";
      let parent: string | undefined = line.match(
        /parent="(([^.:@/"%]|[\/.])+)"/
      )?.[1];
      const instance = line.match(
        /instance=ExtResource\(\s*"?([\w]+)"?\s*\)/
      )?.[1];

      if (line === undefined || name === undefined || type === undefined) {
        throw new Error(`Fail to parse node ${scene.path}
line: ${line}
name: ${name}
type: ${type}
parent: ${parent}
instance: ${instance}
`);
      }

      // leaving this in case we have a reason to use these node paths in the future
      // const rawNodePaths = line.match(/node_paths=PackedStringArray\(([\w",\s]*)\)/)?.[1];
      // coanst nodePaths = rawNodePaths?.split(",").forEach(x => x.trim().replace("\"", ""));

      let _path = "";
      let relativePath: string = "";

      if (parent === undefined) {
        root = name;
        _path = name;
      } else if (parent === ".") {
        parent = root;
        relativePath = name;
        _path = `${parent}/${name}`;
      } else {
        relativePath = `${parent}/${name}`;
        parent = `${root}/${parent}`;
        _path = `${parent}/${name}`;
      }
      if (lastNode) {
        lastNode.body = text.slice(lastNode.position, match.index);
        lastNode.parse_body();
      }
      if (lastResource.id !== EMPTY) {
        lastResource.body = text
          .slice(lastResource.index, match.index)
          .trimEnd();
        lastResource.id = EMPTY;
      }

      const node = new SceneNode(name, type);
      //   let args: SceneNodeArgs = {
      //     path: _path,
      //     description: type,
      //     relativePath: relativePath,
      //     parent: parent,
      //     text: match[0],
      //     position: match.index,
      //     resourceUri: Uri.from({
      //       scheme: "godot",
      //       path: _path,
      //     }),
      //   };
      node.path = _path;
      node.description = type;
      node.relativePath = relativePath;
      node.parent = parent;
      node.text = match[0];
      node.position = match.index;
      node.resourceUri = Uri.from({
        scheme: "godot",
        path: _path,
      });
      scene.nodes.set(_path, node);

      if (instance) {
        const res = scene.externalResources.get(instance);
        if (res) {
          node.tooltip = res.path;
          if (res.path) {
            node.resourcePath = res.path;
            if ([".tscn"].includes(extname(node.resourcePath))) {
              node.contextValue += "openable";
            }
          }
        }
        node.contextValue += "hasResourcePath";
      }
      if (_path === root) {
        scene.root = node;
      }
      if (parent) {
        if (nodes.has(parent)) {
          nodes.get(parent)!.children.push(node);
        }
      }
      //   nodes[_path] = node;
      nodes.set(_path, node);

      lastNode = node;
    }

    if (lastNode) {
      lastNode.body = text.slice(lastNode.position, text.length);
      lastNode.parse_body();
    }

    const resourceRegex = /\[resource\]/g;
    for (const match of text.matchAll(resourceRegex)) {
      if (lastResource) {
        lastResource.body = text
          .slice(lastResource.index, match.index)
          .trimEnd();
        lastResource.id = EMPTY;
      }
    }
    return scene;
  }

  getScene = (name: String): Scene | undefined => {
    for (const [sceneName, scene] of this.scenes) {
      if (name === scene.root?.label) {
        return scene;
      }
    }
  };
}
