import { RustProvider } from "../../providers/RustProvider";
import { assert } from "chai";

describe("treesitter", function () {
  describe("preliminaire", function () {
    it("should r", function () {
      let rp = new RustProvider(`
use::bla::bla;
struct NotGodo;

#[derive(GodotClass)]
struct GodotStruct;

#[derive(NotGodotClass)]
struct NotSoGodo

#[derive(GodotClass)]
#[class(base=CharacterBody2D,init)]
struct GodotStruct2;

#[derive(GodotClass)]
// somme comment
#[someAttribute]
#[class(base=CharacterBody2D,init)]
// another comment
#[someOtherAttribute]
struct GodotStruct3;
`);

      let res = rp.findGodotClassName();
      console.log(res);
      assert.deepEqual(res, ["GodotStruct", "GodotStruct2", "GodotStruct3"]);
    });
  });
});
