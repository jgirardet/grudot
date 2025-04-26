# Godot4 Rust

This extension aims to add some usefull shortcuts when using Rust with Godot

## Features

#### Add `OnReady` as simple as in Godot

- Adds fields automagically with correct Type and name. Struct must be [`init`](https://godot-rust.github.io/docs/gdext/master/godot/register/derive.GodotClass.html#construction)

https://github.com/user-attachments/assets/4a9904bf-6ff1-4570-8b82-b015ea439fd4

#### Derive new rust module from existing Godot Scene

- Select and existing Godot Scene from you project
- You can choose to create a new rust module or use the active one (will add `mod mymodule` if needed)
- Pick `Godot Methods` and `OnReady` you want to add
- here you are !!!

https://github.com/user-attachments/assets/af8f9d93-9528-4980-8b57-63ca8d41cbf7

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

- `godot4-rust.godotProjectFilePath`: REQUIRED: selected the .godot project file. Use dedicated command to set it (Ctrl+Maj+P => Godot4-Rust: set Godot Project). It sets workspace only.

## Known Issues

## Release Notes

### 0.1.0

Initial release
