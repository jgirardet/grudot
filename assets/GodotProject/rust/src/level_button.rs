use godot::{
    classes::{Button, INinePatchRect, Label, NinePatchRect, TextureRect},
    prelude::*,
};

#[derive(GodotClass)]
#[class(base=NinePatchRect,init)]
struct LevelButton {
    base: Base<NinePatchRect>,
    #[init(node = "LevelLabel")]
    level_label: OnReady<Gd<Label>>,
    #[init(node = "CheckMark")]
    check_mark: OnReady<Gd<TextureRect>>,
    #[init(node = "Button")]
    button: OnReady<Gd<Button>>,
}

#[godot_api]
impl INinePatchRect for LevelButton {
    fn ready(&mut self) {}

    fn process(&mut self, delta: f64) {}
}
