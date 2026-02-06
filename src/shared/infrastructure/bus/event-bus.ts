import { IDomainEvent, IEventHandler } from "../../kernel/cqrs.ts";
import { logger as defaultLogger } from "../logging/logger.ts";

export interface ILogger {
    error(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
}

export class EventBus {
    private handlers = new Map<string, IEventHandler<any>[]>();

    constructor(private logger: ILogger = defaultLogger) {}

    /**
     * Registers a handler for a specific event type.
     * Supports multiple handlers per event (1-to-many).
     */
    subscribe<E extends IDomainEvent>(eventName: string, handler: IEventHandler<E>) {
        if (!this.handlers.has(eventName)) {
            this.handlers.set(eventName, []);
        }
        this.handlers.get(eventName)!.push(handler);
    }

    /**
     * Publishes an event to all registered handlers.
     * Executes handlers in parallel (Promise.allSettled) to ensure isolation.
     * Errors in one handler do not block others.
     */
    async publish(event: IDomainEvent): Promise<void> {
        const eventName = event.constructor.name;
        const handlers = this.handlers.get(eventName);

        if (!handlers || handlers.length === 0) {
            this.logger.info(`No handlers registered for event: ${eventName}`);
            return;
        }

        const results = await Promise.allSettled(
            handlers.map(handler => handler.handle(event))
        );

        results.forEach((result, index) => {
            if (result.status === "rejected") {
                this.logger.error(
                    `Error handling event ${eventName} with handler ${handlers[index].constructor.name}`,
                    result.reason
                );
            }
        });
    }
}

export const eventBus = new EventBus();
