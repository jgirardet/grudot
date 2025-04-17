import { QuickPickItem } from "vscode";
import { Node } from "./NodesBuilder";

export { NodeQuickItem };

class NodeQuickItem implements QuickPickItem {
  label: string;
  node: Node;
  //   description?: string | undefined;
  constructor(node: Node) {
    this.node = node;
    let nb_sub = node.path.split("/").length;
    this.label = `${"-".repeat(nb_sub * 3)}> ${node.path}  (${node.type})`;
  }
}
