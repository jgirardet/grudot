mod main_scene;
mod level_button;

use godot::prelude::*;

struct SkobanExtension;

#[gdextension]
unsafe impl ExtensionLibrary for SkobanExtension {}
