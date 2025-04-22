use godot::{
    classes::{GridContainer, INode2D, Node2D},
    prelude::*,
};

#[derive(GodotClass)]
#[class(base = Node2D, init)]
pub struct Level {
    #[base]
    base: Base<Node2D>,
    #[init(node = "TileLayers")]
    tile_layers: OnReady<Gd<Node2D>>,
}

#[godot_api]
impl INode2D for Level {
    fn ready(&mut self) {
        // godot_print!("{:?}", self.grid)
    }
}
