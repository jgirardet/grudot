import { toSnake } from "ts-case-convert";
import { Node } from "./NodesBuilder";
export { onready_snippet, node_methods };

const onready_snippet = (node: Node): string[] => {
  return [
    `#[init(node = "${node.path}")]`,
    `${toSnake(node.name)}: OnReady<Gd<${node.type}>>,$0`,
  ];
};

const node_methods = {
  init: "fn init(base: Base<Self::Base>) -> Self {}",
  ready: "fn ready(&mut self) {}",
  process: "fn process(&mut self, delta: f64) {}",
  physics_process: "fn physics_process(&mut self, delta: f64) {}",
  enter_tree: "fn enter_tree(&mut self) {}",
  exit_tree: "fn exit_tree(&mut self) {}",
  to_string: "fn to_string(&self) -> GString {}",
  input: "fn input(&mut self, event: Gd<InputEvent>) {}",
  shortcut_input: "fn shortcut_input(&mut self, event: Gd<InputEvent>) {}",
  unhandled_input: "fn unhandled_input(&mut self, event: Gd<InputEvent>) {}",
  unhandled_key_input:
    "fn unhandled_key_input(&mut self, event: Gd<InputEvent>) {}",
  on_notifcation: "fn on_notification(&mut self, what: NodeNotification) {}",
  get_property:
    "fn get_property(&self, property: StringName) -> Option<Variant> {}",
  set_property:
    "fn set_property(&mut self, property: StringName, value: Variant) -> bool {}",
  get_property_list: "fn get_property_list(&mut self) -> Vec<PropertyInfo> {}",
  validate_property:
    "fn validate_property(&self, property: &mut PropertyInfo) {}",
  property_get_revert:
    "fn property_get_revert(&self, property: StringName) -> Option<Variant> {}",
  get_configuration_warnings:
    "fn get_configuration_warnings(&self) -> PackedStringArray {}",
};
