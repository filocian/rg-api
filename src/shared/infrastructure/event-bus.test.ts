import { assertEquals } from "jsr:@std/assert";
import { IDomainEvent, IEventHandler } from "../kernel/cqrs.ts";
import { EventBus } from "./bus/event-bus.ts";

class TestEvent implements IDomainEvent {
    eventId = "1";
    occurredOn = new Date();
    aggregateId = "123";
    constructor(public value: string) {}
}

/**
 * EventBus Tests
 */
Deno.test("EventBus - Multiple Subscribers", async () => {
    const bus = new EventBus();
    const results: string[] = [];

    const handler1: IEventHandler<TestEvent> = {
        handle: async (event) => { results.push("h1:" + event.value); }
    };

    const handler2: IEventHandler<TestEvent> = {
        handle: async (event) => { results.push("h2:" + event.value); }
    };

    bus.subscribe("TestEvent", handler1);
    bus.subscribe("TestEvent", handler2);

    await bus.publish(new TestEvent("test"));

    assertEquals(results.length, 2);
    assertEquals(results.includes("h1:test"), true);
    assertEquals(results.includes("h2:test"), true);
});

Deno.test("EventBus - Error Isolation", async () => {
    // Mock logger to verify error logging
    const errors: any[] = [];
    const mockLogger = {
        error: (_msg: string, reason: any) => { errors.push(reason); },
        info: (_msg: string) => {},
        warn: (_msg: string) => {}
    };

    const bus = new EventBus(mockLogger);
    const results: string[] = [];

    const failingHandler: IEventHandler<TestEvent> = {
        handle: async () => { throw new Error("Fail!"); }
    };

    const successHandler: IEventHandler<TestEvent> = {
        handle: async (event) => { results.push("success:" + event.value); }
    };

    bus.subscribe("TestEvent", failingHandler);
    bus.subscribe("TestEvent", successHandler);

    // Should not throw
    await bus.publish(new TestEvent("test"));

    // Success handler should still run
    assertEquals(results[0], "success:test");
    // Error should be logged
    assertEquals(errors.length, 1);
    assertEquals(errors[0].message, "Fail!");
});
