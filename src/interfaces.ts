export { Tscn, Node, Heading, Instance, ExtResource, RHeading };

interface Tscn {
  entities: [Node];
}
interface Node {
  heading: Heading | RHeading;
  type: string;
}
interface Heading {
  type?: string;
  instance?: Instance;
  parent: string;
  name: string;
}

interface Instance {
  params: string[];
}

interface ExtResource {
  heading: RHeading;
}

interface RHeading {
  type: string;
  path: string;
  id: string;
}
