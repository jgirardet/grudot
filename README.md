# Godot4 Rust

This extension aims to add some usefull shortcuts when using Rust with Godot

## Features

[**Automagicaly `setup a whole new Rust project` linked to your Godot project**](#automagicaly-setup-a-whole-new-rust-project-linked-to-your-godot-project)

[**Add `OnReady` as simple as in Godot**](#add-onready-as-simple-as-in-godot)

[**`Derive` new rust module from existing `Godot Scene`**](#derive-new-rust-module-from-existing-godot-scene)

[**Easy configure project**](#first-you-need-to-configure-the-linked-godot-project)

[**Create .gdextension file**](#create-gdextension-in-your-godot-project)

## Usage

#### First you need to configure the linked Godot Project

Use dedicated command to set it (Ctrl+Maj+P => Godot4-Rust: set Godot Project)

### Automagicaly `setup a whole new Rust project`- linked to your Godot project

Use dedicated command (Ctrl+Maj+P => Godot4-Rust: start a new GDExtension Project). Just select project.godot file, choose a crate name and directory and you get:

- New Rust crate
- latest godot dependacy in Carg.toml (with cdylib)
- Extension declared in lib.rs
- the .gdextension file added inside your godot project
- .vscode/settings.json configured to use this extension



https://github.com/user-attachments/assets/c8243982-5a21-4fba-b214-54a651beb64b



#### Add `OnReady` as simple as in Godot

- Adds fields automagically with correct Type and name. Struct must be [`init`](https://godot-rust.github.io/docs/gdext/master/godot/register/derive.GodotClass.html#construction)

https://github.com/user-attachments/assets/4a9904bf-6ff1-4570-8b82-b015ea439fd4

#### Derive new rust module from existing Godot Scene

- Select and existing Godot Scene from you project
- You can choose to create a new rust module or use the active one (will add `mod mymodule` if needed)
- Pick `Godot Methods` and `OnReady` you want to add
- here you are !!!

https://github.com/user-attachments/assets/af8f9d93-9528-4980-8b57-63ca8d41cbf7

#### Create .gdextension in your Godot Project

- First: Be sure to have run **Set Godot Project** command
- Second: Run command **Godot4-Rust: Create a the .gdextension file in your project**, and that's it.

By default `compatibility minimum` is set following the value of your godot.project file.

## Extension Settings

This extension contributes the following settings:

- `godot4-rust.godotProjectFilePath`: REQUIRED: selected the .godot project file. Use dedicated command to set it (Ctrl+Maj+P => Godot4-Rust: set Godot Project). It sets workspace only.

## Known Issues

## Release Notes

### 0.1.0

Initial release
