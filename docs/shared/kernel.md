# Shared Kernel

The shared kernel contains fundamental domain abstractions used throughout the API.

## CQRS (Command Query Responsibility Segregation)

**Location:** `src/shared/kernel/cqrs.ts`

### ICommand

Marker interface for Commands. Commands represent intentions to change state.

```typescript
import { ICommand, ICommandHandler } from "../shared/kernel/cqrs.ts";

// Define a Command
export class CreateOrderCommand implements ICommand {
    constructor(
        public readonly productId: string,
        public readonly quantity: number
    ) {}
}

// Define its Handler
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand, Order> {
    async handle(command: CreateOrderCommand): Promise<Order> {
        // Creation logic
        return newOrder;
    }
}
```

### IQuery

Marker interface for Queries. Queries represent potential reads without side effects.

```typescript
import { IQuery, IQueryHandler } from "../shared/kernel/cqrs.ts";

export class GetOrderQuery implements IQuery {
    constructor(public readonly orderId: string) {}
}

export class GetOrderHandler implements IQueryHandler<GetOrderQuery, OrderView> {
    async handle(query: GetOrderQuery): Promise<OrderView> {
        return orderView;
    }
}
```

## Domain Types

**Location:** `src/shared/kernel/domain-types.ts`

### Entity

Base class for domain entities. Identified by their ID.

```typescript
import { Entity } from "../shared/kernel/domain-types.ts";

export class User extends Entity<string> {
    constructor(
        id: string,
        public email: string,
        public name: string
    ) {
        super(id);
    }
}

const user1 = new User("123", "a@b.com", "John");
const user2 = new User("123", "different@email.com", "Jane");

user1.equals(user2); // true (same ID)
```

### ValueObject

Base class for Value Objects. Identified by their properties, immutable.

```typescript
import { ValueObject } from "../shared/kernel/domain-types.ts";

interface MoneyProps {
    amount: number;
    currency: string;
}

export class Money extends ValueObject<MoneyProps> {
    get amount() { return this.props.amount; }
    get currency() { return this.props.currency; }
    
    static create(amount: number, currency: string): Money {
        return new Money({ amount, currency });
    }
}

const m1 = Money.create(100, "EUR");
const m2 = Money.create(100, "EUR");
m1.equals(m2); // true (same properties)
```

### AggregateRoot

Extends Entity to support Domain Events.

```typescript
import { AggregateRoot, IDomainEvent } from "../shared/kernel/domain-types.ts";

export class Order extends AggregateRoot<string> {
    confirm() {
        this.addDomainEvent({
            eventId: crypto.randomUUID(),
            occurredOn: new Date(),
            aggregateId: this.id,
            type: "OrderConfirmed"
        });
    }
}

// After save:
const events = order.pullEvents();
// Dispatch events to event bus
```

## Multi-Tenancy

See [multi-region.md](./multi-region.md) for complete documentation.

| Class | Purpose |
| :--- | :--- |
| `RegionId` | Value Object for supported regions |
| `TenantContext` | Current tenant context (tenantId + regionId) |
| `TenantRegionResolver` | Interface to resolve a tenant's region |
