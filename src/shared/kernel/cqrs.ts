
/**
 * Marker interface for Domain Events
 */
export interface IDomainEvent {
    eventId: string;
    occurredOn: Date;
    aggregateId: string;
}

/**
 * Marker interface for Commands
 */
export interface ICommand {
    // Commands usually have data properties
}

/**
 * Interface for Command Handlers
 */
export interface ICommandHandler<C extends ICommand, R> {
    handle(command: C): Promise<R>;
}

/**
 * Marker interface for Queries
 */
export interface IQuery {
    // Queries usually have filter criteria
}

/**
 * Interface for Query Handlers
 */
export interface IQueryHandler<Q extends IQuery, R> {
    handle(query: Q): Promise<R>;
}

/**
 * Interface for Event Handlers
 */
export interface IEventHandler<E extends IDomainEvent> {
    handle(event: E): Promise<void>;
}
