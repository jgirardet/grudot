use godot::{
    classes::{Control, GridContainer, IControl, Label},
    prelude::*,
};

#[derive(GodotClass)]
#[class(base=Control,init)]
struct Main {
    base: Base<Control>,
    #[init(node = "MC/VB/Label")]
    label: OnReady<Gd<Label>>,
    #[init(node = "MC/VB/Grid")]
    grid: OnReady<Gd<GridContainer>>,
}

#[godot_api]
impl IControl for Main {
    fn ready(&mut self) {}

    fn process(&mut self, delta: f64) {}

    fn enter_tree(&mut self) {}
}
