import Parser, { Tree, Query, SyntaxNode, QueryCapture } from "tree-sitter";
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

  /// Find the First GodotClass
  findGodotClass(): ParsedGodotModule | undefined {
    let q = new Query(
      Rust as Parser.Language,
      `
(
  (attribute_item
    (attribute 
      (identifier) @derive  (#eq? @derive "derive")
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
    (attribute_item
        (attribute 
            (identifier) @class (#eq? @class "class")
            arguments: (token_tree
                (
                    (identifier)  @baseKw (#eq? @baseKw  "base")
                    .
                    "="
                    .
                    (identifier) @baseClass
                )?
               ( 
                (identifier) @init (#eq? @init "init")
                )?
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

    let res = q.matches(this.rootNode).at(0);

    // ;
    console.log("RES");
    console.log(res);
    if (res?.captures === undefined || res.captures.length === 0) {
      return;
    }
    console.log(pickValues(this._tree, res.captures));
  }

  isGodotModule(): boolean {
    return true;
  }
}

const pickValues = (tree: Tree, captures: QueryCapture[]) => {
  let res: ParsedGodotModule = {};

  // const name = captures.at(captures.findIndex((p) => p.name === "className"));
  // if (!name) {
  //   return;
  // }
  for (const c of captures) {
    res[c.name as keyof ParsedGodotModule] = tree.getText(c.node);
  }
  return res;
};

export interface ParsedGodotModule {
  className?: string;
  init?: string;
  // Captures = (captures:QueryCapture[]):GodotModule {
}
