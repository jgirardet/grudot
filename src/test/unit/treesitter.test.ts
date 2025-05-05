import {
  pickValuesLoop,
  pickValuesLoopShrinked,
  RustProvider,
} from "../../providers/RustProvider";
import { assert } from "chai";
import Benchmark from "benchmark";

// describe("treesitter", function () {
//   describe("preliminaire", function () {
//     it("should r", function () {
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

let res = rp.findGodotClass();
//       assert.deepEqual(res, {
//         className: "GodotStruct",
//       });
//     });
//   });
// });
var suite = new Benchmark.Suite();

// add tests
suite
  .add("stadard", function () {
    pickValuesLoop(rp._tree, res);
  })
  .add("Shrinked", function () {
    pickValuesLoopShrinked(rp._tree, res);
  })
  // add listeners
  .on("cycle", function (event: Benchmark.Event) {
    console.log(String(event.target));
    // console.log(String(event.));
  })
  .on("complete", function () {
    console.log("Fastest is " + suite.filter("fastest").map("name"));
    for (const [k, v] of Object.entries(suite)) {
      console.log(v.stats.mean);
    }
  })
  // run async
  .run({ async: true });
