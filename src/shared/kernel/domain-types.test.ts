
import { assertEquals } from "jsr:@std/assert";
import { Entity, ValueObject } from "./domain-types.ts";

/**
 * Testing Entity Equality
 */
class TestEntity extends Entity<string> {
    constructor(id: string) {
        super(id);
    }
}

Deno.test("Entity - Equality works by ID", () => {
    const id1 = "id-1";
    const id2 = "id-2";

    const entity1 = new TestEntity(id1);
    const entity1Copy = new TestEntity(id1);
    const entity2 = new TestEntity(id2);

    assertEquals(entity1.equals(entity1Copy), true);
    assertEquals(entity1.equals(entity2), false);
    assertEquals(entity1.equals(undefined), false);
});

/**
 * Testing Value Object Equality
 */
interface LocProps {
    x: number;
    y: number;
}
class Location extends ValueObject<LocProps> {
    constructor(props: LocProps) {
        super(props);
    }
}

Deno.test("ValueObject - Equality works by structural property comparison", () => {
    const loc1 = new Location({ x: 1, y: 2 });
    const loc2 = new Location({ x: 1, y: 2 });
    const loc3 = new Location({ x: 2, y: 3 });

    assertEquals(loc1.equals(loc2), true);
    assertEquals(loc1.equals(loc3), false);
});
