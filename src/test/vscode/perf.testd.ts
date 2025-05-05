import { assert } from "chai";

import { describe, it } from "node:test";
import { SceneParser } from "../../godotVscode/scene_tools/parser";
import { glob } from "glob";
import path from "path";

describe("Test Regex struct", function () {
  return it("test scene size", async () => {
    let sp = new SceneParser();
    for (const scene of await glob("**/*.tscn", {
      cwd: "/home/jim/Rien/Scalazard",
      absolute: true,
    })) {
      // console.log(scene);
      sp.parse_scene(path.resolve(scene));
      console.log(sp.scenes.keys.length);
    }
  });
});
