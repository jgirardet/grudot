import Parser, { Tree, Query, SyntaxNode } from "tree-sitter";
import { Name } from "../types";
import Rust from "tree-sitter-rust";

export class RustProvider {
  source: string;
  _parser: Parser = new Parser();
  _tree: Tree;

  constructor(source: string) {
    this.source = source;
    this._parser.setLanguage(Rust as Parser.Language);
    this._tree = this._parser.parse(source);
  }

  get rootNode(): SyntaxNode {
    return this._tree.rootNode;
  }
  findGodotClassName(): string[] {
    let q = new Query(
      Rust as Parser.Language,
      `
(
  (attribute_item
    (attribute 
      (identifier) @derive
      (#eq? @derive "derive")
      arguments: (token_tree
        (identifier) @godotclass
        (#eq? @godotclass "GodotClass")
      )
    )
  )
  .
  [
    (attribute_item)
    (line_comment)
  ]*
  .
  (struct_item 
    name: (type_identifier) @name
  )
)
`
    );
    return q
      .matches(this.rootNode)
      .map((m) => this._tree.getText(m.captures.at(2)!.node)); // ! ok because a test exists
  }

  isGodotModule(): boolean {
    return true;
  }
}
