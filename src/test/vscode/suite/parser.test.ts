import * as assert from "assert";
import { SceneParser } from "../../../godotVscode/scene_tools";
import path from "path";
import { readFileSync } from "fs";
import { glob } from "glob";
const sizeof = require("object-sizeof");

suite("test Parser", () => {
  test("Simple parse", () => {
    let parser = new SceneParser();
    let res = parser.parse_scene(
      path.resolve(
        __dirname,
        "../../../../assets/GodotProject/Scenes/Main/main.tscn"
      )
    );
    assert.equal(
      JSON.stringify(res),
      readFileSync(
        path.resolve(
          __dirname,
          "../../../../src/test/fixtures/main_parsed.json"
        ),
        { encoding: "utf-8" }
      )
    );

    // writeFileSync(
    //   // mkdirSync(__dirname, "../../../test/di),
    //   "/tmp/main_parsed.json",
    //   JSON.stringify(res),
    //   { encoding: "utf-8" }
    // );
  });
  //   test("size", async () => {
  //     let sp = new SceneParser();
  //     for (const scene of await glob("**/*.tscn", {
  //       cwd: "/home/jim/Rien/Scalazard",
  //       absolute: true,
  //     })) {
  //       // console.log(scene);
  //       sp.parse_scene(path.resolve(scene));
  //       console.log(sp.scenes.keys.length);
  //       let roughObjSize = JSON.stringify(Object.fromEntries(sp.scenes)).length;
  //       console.log(roughObjSize);

  //       throw new Error(`${sizeof(sp.scenes)} ${roughObjSize}`);
  //     }
  //   });
});
