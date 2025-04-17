// Import the module and reference it with the alias vscode in your code below
import path from "path";
import { Heading, RHeading, Tscn } from "./interfaces";

const convert = require("tscn2json");

export { Node, NodesBuilder };

class Node {
  name: string;
  path: string;
  type: string;

  constructor(name: string, parent: string, type: string) {
    const path =
      parent === undefined || parent === "." ? name : parent + "/" + name;
    this.name = name;
    this.path = path;
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

  choices = (): string[] => {
    let res: string[] = [];
    res.push(`> ${this.nodes[0].name}`);
    let conter = 1;
    for (let s of this.nodes.slice(1, this.nodes.length)) {
      let nb_sub = s.path.split("/").length;
      res.push(`${conter} ${"-".repeat(nb_sub * 3)}> ${s.path}  (${s.type})`);
      conter++;
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

  root_path = (): string => path.dirname(this.godot_project);

  parse = async (filepath: string) => {
    const tscn = await this.parse_tscn(path.join(this.godot_project, filepath));
    this.parse_converted(tscn);
  };

  parse_tscn = async (path: String): Promise<Tscn> => {
    let converted: Tscn = await convert({ input: path });
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
    let other_path = path.join(
      this.root_path(),
      path_res.path.replace("res://", "")
    );
    await other_tscn.parse(other_path);
    return other_tscn.nodes[0].type!;
  };
}
