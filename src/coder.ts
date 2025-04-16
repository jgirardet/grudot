import { objectToSnake, toSnake } from "ts-case-convert";
import { Scene } from "./SceneBuilder";
export { onready_snippet };

const onready_snippet = (scene: Scene): string[] => {
  return [
    `#[init(node = "${scene.path}")]\n`,
    `${toSnake(scene.name)}: OnReady<Gd<${scene.type}>>,`,
  ];
};
