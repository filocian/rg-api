
import { IDomainEvent } from "./cqrs.ts";

/**
 * Base class for Entities.
 * Entities are identified by their unique ID, not their attributes.
 */
export abstract class Entity<TId> {
    public readonly id: TId;

    constructor(id: TId) {
        this.id = id;
    }

    public equals(object?: Entity<TId>): boolean {
        if (object == null || object == undefined) {
            return false;
        }

        if (this === object) {
            return true;
        }

        if (!isEntity(object)) {
            return false;
        }

        return this.id === object.id;
    }
}

const isEntity = (candidate: any): candidate is Entity<any> => {
    return candidate instanceof Entity;
};

/**
 * Base class for Value Objects.
 * Value Objects are identified by their properties, not an ID.
 * They should be immutable.
 */
export abstract class ValueObject<TProps> {
    protected readonly props: TProps;

    constructor(props: TProps) {
        this.props = Object.freeze(props);
    }

    public equals(valueObject?: ValueObject<TProps>): boolean {
        if (valueObject === null || valueObject === undefined) {
            return false;
        }
        if (valueObject.props === undefined) {
            return false;
        }
        return JSON.stringify(this.props) === JSON.stringify(valueObject.props);
    }
}

/**
 * Aggregate Roots are Entities that act as consistency boundaries.
 * They are responsible for emitting Domain Events.
 */
export abstract class AggregateRoot<TId> extends Entity<TId> {
    private internalDomainEvents: IDomainEvent[] = [];

    get domainEvents(): IDomainEvent[] {
        return this.internalDomainEvents;
    }

    protected addDomainEvent(domainEvent: IDomainEvent): void {
        // Add the event to the list
        this.internalDomainEvents.push(domainEvent);
        // Mark the event with this aggregate's ID if not already present (optional logic logic depending on event structure)
    }

    public clearEvents(): void {
        this.internalDomainEvents = [];
    }

    /**
     * Use this to pull events and clear the list in one go.
     * Useful for the infrastructure layer to dispatch events after saving.
     */
    public pullEvents(): IDomainEvent[] {
        const events = this.internalDomainEvents.slice();
        this.clearEvents();
        return events;
    }
}
