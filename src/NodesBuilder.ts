// Import the module and reference it with the alias vscode in your code below
import path from "path";
import { Heading, RHeading, Tscn } from "./interfaces";
import { NodeQuickItem } from "./quick_pick_items";

const convert = require("tscn2json");

export { Node, NodesBuilder };

class Node {
  name: string;
  path: string;
  type: string;

  constructor(name: string, parent: string, type: string) {
    const f_path =
      parent === undefined || parent === "." ? name : parent + "/" + name;
    this.name = name;
    this.path = f_path;
    this.type = type;
  }

  static from_heading(h: Heading): Node {
    if (h.type === undefined) {
      throw new Error(`${h}: type must not be undefined`);
    }
    return new Node(h.name, h.parent, h.type!);
  }
}

class Nodes {
  nodes: Node[];

  constructor(scenes: Node[]) {
    this.nodes = scenes;
  }

  choices = (): NodeQuickItem[] => {
    let res: NodeQuickItem[] = [];
    res.push(new NodeQuickItem(this.nodes[0]));
    for (let s of this.nodes.slice(1, this.nodes.length)) {
      res.push(new NodeQuickItem(s));
    }
    return res;
  };
}

class NodesBuilder {
  godot_project: string;
  nodes: Heading[] = [];
  resources: RHeading[] = [];

  constructor(godot_project: string) {
    this.godot_project = godot_project;
  }

  parse = async (filepath: string) => {
    const tscn = await this.parse_tscn(filepath);
    this.parse_converted(tscn);
  };

  parse_tscn = async (filepath: string): Promise<Tscn> => {
    let converted: Tscn = await convert({
      input: path.join(this.godot_project, filepath),
    });
    return converted;
  };

  parse_converted = (tscn: Tscn) => {
    for (let a of tscn.entities) {
      if (a.type === "node") {
        this.nodes.push(a.heading as Heading);
      }
      if (a.type === "ext_resource") {
        this.resources.push(a.heading as RHeading);
      }
    }
  };
  get_node_tree = async (): Promise<Nodes> => {
    const res_tree = [];
    for (const n of this.nodes) {
      if (n.type === undefined) {
        const other_type = await this.parse_instance(n, this.resources);
        res_tree.push(new Node(n.name, n.parent, other_type));
      } else {
        res_tree.push(Node.from_heading(n));
      }
    }
    return new Nodes(res_tree);
  };

  parse_instance = async (h: Heading, r: RHeading[]): Promise<string> => {
    if (h.instance === undefined) {
      throw new Error(`{h} instance should not ben undefined`);
    }
    const res_name = h.instance.params[0];
    let path_res = r.find((v, _, __) => v.id === res_name);
    if (path_res === undefined) {
      throw new Error(`${res_name} not found`);
    }
    var other_tscn = new NodesBuilder(this.godot_project);
    // let other_path = path.join(
    //   this.godot_project,
    //   path_res.path.replace("res://", "")
    // );
    let other_path = path_res.path.replace("res://", "");
    await other_tscn.parse(other_path);
    return other_tscn.nodes[0].type!;
  };
}
