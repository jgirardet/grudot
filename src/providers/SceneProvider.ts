import {
  CancellationToken,
  Disposable,
  Event,
  FileChangeEvent,
  FileStat,
  FileSystemProvider,
  FileSystemWatcher,
  FileType,
  ProviderResult,
  RelativePattern,
  TreeDataProvider,
  TreeItem,
  Uri,
  workspace,
} from "vscode";
import { Scene, SceneNode, SceneParser } from "../godotVscode/scene_tools";
import { FullPathDir } from "../types";

export default class SceneProvider implements Disposable {
  disposables: Disposable[] = [];
  godotProjectDir: FullPathDir;
  filesWatcher: FileSystemWatcher;
  parser: SceneParser;

  constructor(godotProjectdir: FullPathDir) {
    this.godotProjectDir = godotProjectdir;
    this.parser = new SceneParser();

    const pattern = new RelativePattern(godotProjectdir, "**/*.tscn");
    this.disposables.push(
      (this.filesWatcher = workspace.createFileSystemWatcher(pattern)),
      this.filesWatcher.onDidCreate(this.onTscnChanged.bind),
      this.filesWatcher.onDidDelete(this.onTscnDeleted.bind)
    );
  }
  dispose() {
    for (const disp of this.disposables) {
      disp.dispose();
    }
  }

  onTscnChanged(u: Uri) {}
  onTscnDeleted(u: Uri) {}
}
