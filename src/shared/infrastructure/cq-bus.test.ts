import { assertEquals, assertRejects } from "jsr:@std/assert";
import { ICommand, ICommandHandler } from "../kernel/cqrs.ts";
import { CQBus } from "./bus/cq-bus.ts";

class TestCommand implements ICommand {
    constructor(public value: string) {}
}

class TestHandler implements ICommandHandler<TestCommand, string> {
    async handle(command: TestCommand): Promise<string> {
        return "Handled: " + command.value;
    }
}

/**
 * CQBus Tests
 */
Deno.test("CQBus - Command Execution (Sync)", async () => {
    const cqBus = new CQBus();
    cqBus.registerCommand("TestCommand", new TestHandler());
    
    // Should execute directly and return result
    const result = await cqBus.dispatchCommand(new TestCommand("test"));
    assertEquals(result, "Handled: test");
});

Deno.test("CQBus - Missing Command Handler", async () => {
    // Mock logger to avoid side effects
    const mockLogger = {
        error: (_msg: string) => {},
        info: (_msg: string) => {},
        warn: (_msg: string) => {}
    };
    const cqBus = new CQBus(mockLogger);
    await assertRejects(
        () => cqBus.dispatchCommand(new TestCommand("foo")),
        Error,
        "No handler registered"
    );
});

Deno.test("CQBus - Queries are Sync", async () => {
    const cqBus = new CQBus();
    cqBus.registerQuery("MyQuery", { handle: async () => "result" });
    
    const queryResult = await cqBus.dispatchQuery(new class MyQuery {});
    assertEquals(queryResult, "result");
});
