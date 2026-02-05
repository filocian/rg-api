import { assertEquals, assertRejects } from "jsr:@std/assert";
import { ICommand, ICommandHandler } from "../kernel/cqrs.ts";
import { Dispatcher } from "./bus/dispatcher.ts";

class TestCommand implements ICommand {
    constructor(public value: string) {}
}

class TestHandler implements ICommandHandler<TestCommand, string> {
    async handle(command: TestCommand): Promise<string> {
        return "Handled: " + command.value;
    }
}

/**
 * Dispatcher Tests
 */
Deno.test("Dispatcher - Command Execution (Sync)", async () => {
    const dispatcher = new Dispatcher();
    dispatcher.registerCommand("TestCommand", new TestHandler());
    
    // Should execute directly and return result
    const result = await dispatcher.dispatchCommand(new TestCommand("test"));
    assertEquals(result, "Handled: test");
});

Deno.test("Dispatcher - Missing Command Handler", async () => {
    // Mock logger to avoid side effects
    const mockLogger = {
        error: (_msg: string) => {},
        info: (_msg: string) => {},
        warn: (_msg: string) => {}
    };
    const dispatcher = new Dispatcher(mockLogger);
    await assertRejects(
        () => dispatcher.dispatchCommand(new TestCommand("foo")),
        Error,
        "No handler registered"
    );
});

Deno.test("Dispatcher - Queries are Sync", async () => {
    const dispatcher = new Dispatcher();
    dispatcher.registerQuery("MyQuery", { handle: async () => "result" });
    
    const queryResult = await dispatcher.dispatchQuery(new class MyQuery {});
    assertEquals(queryResult, "result");
});
