import { getGodotProjectDir } from "../godotProject";
import { selectTscn } from "../utils";
import { NodesBuilder, Nodes } from "./NodesBuilder";

export { buildNodeTreeFromPickedTscn as buildNodeTreeFromSingleTscn };

// select a .tscn file in project
const buildNodeTreeFromPickedTscn = async (): Promise<Nodes | undefined> => {
  const godotProjectPath = getGodotProjectDir();
  const selected = await selectTscn(godotProjectPath);
  if (selected === undefined) {
    return;
  }

  return NodesBuilder.build(godotProjectPath, selected);
};
