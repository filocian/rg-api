import { ICommand, ICommandHandler, IQuery, IQueryHandler } from "../../kernel/cqrs.ts";
import { AppError } from "../errors/app-error.ts";
import { logger as defaultLogger } from "../logging/logger.ts";

export interface ILogger {
    error(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
}

export class CQBus {
    private commandHandlers = new Map<string, ICommandHandler<any, any>>();
    private queryHandlers = new Map<string, IQueryHandler<any, any>>();

    constructor(private logger: ILogger = defaultLogger) {}


    registerCommand(commandName: string, handler: ICommandHandler<any, any>) {
        this.commandHandlers.set(commandName, handler);
    }

    registerQuery(queryName: string, handler: IQueryHandler<any, any>) {
        this.queryHandlers.set(queryName, handler);
    }

    /**
     * Dispatches a Command to its handler.
     * Executes synchronously (awaits the handler).
     */
    async dispatchCommand<R>(command: ICommand): Promise<R> {
        const name = command.constructor.name;
        const handler = this.commandHandlers.get(name);
        
        if (!handler) {
            this.logger.error(`No handler registered for command: ${name}`);
            throw AppError.from("INTERNAL_SERVER_ERROR", `No handler registered for command: ${name}`);
        }
        
        // Execute directly
        return await handler.handle(command);
    }

    /**
     * Dispatches a Query to its handler.
     * Executes synchronously (awaits the handler).
     */
    async dispatchQuery<R>(query: IQuery): Promise<R> {
        const name = query.constructor.name;
        const handler = this.queryHandlers.get(name);
        
        if (!handler) {
            this.logger.error(`No handler registered for query: ${name}`);
            throw AppError.from("INTERNAL_SERVER_ERROR", `No handler registered for query: ${name}`);
        }
        
        return await handler.handle(query);
    }
}

export const cqBus = new CQBus();
