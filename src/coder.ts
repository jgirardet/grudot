import { toSnake } from "ts-case-convert";
import { Node } from "./NodesBuilder";
export { onready_snippet };

const onready_snippet = (node: Node): string[] => {
  return [
    `#[init(node = "${node.path}")]`,
    `${toSnake(node.name)}: OnReady<Gd<${node.type}>>,$0`,
  ];
};
