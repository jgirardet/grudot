import { assert } from "chai";

import { describe, it } from "node:test";
import { REGEX_STRUCT } from "../../constantes";

const testStruct = (cas: string, tested: string) => {
  return it(cas, function () {
    assert.equal(tested.match(REGEX_STRUCT)![1], "Perso", cas);
  });
};

describe("Test Regex struct", function () {
  testStruct(
    "simple",
    `#[derive(GodotClass)]
struct Perso {`
  );
  testStruct(
    "with class attribute",
    `#[derive(GodotClass)]
#[class(base=CharacterBody2D,init)]
struct Perso {`
  );
  testStruct(
    "with multiline class attribute between",
    `#[derive(GodotClass)]
#[class(base=CharacterBody2D,init)]
#[class(base=CharacterBody2D,init)]
struct Perso {`
  );
  testStruct(
    "with multiline comment/doc attribute between",
    `#[derive(GodotClass)]
// #[class(base=CharacterBody2D,init)]
/// #[class(base=CharacterBody2D,init)]
struct Perso {`
  );
  testStruct(
    "with pub",
    `#[derive(GodotClass)]
pub struct Perso {`
  );
  testStruct(
    "with pub(crate)",
    `#[derive(GodotClass)]
pub(crate) struct Perso {`
  );
});
