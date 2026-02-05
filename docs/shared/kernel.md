# Shared Kernel

El kernel compartido contiene las abstracciones fundamentales de dominio usadas en toda la API.

## CQRS (Command Query Responsibility Segregation)

**Ubicación:** `src/shared/kernel/cqrs.ts`

### ICommand
Marker interface para Commands. Los commands representan intenciones de cambio.

```typescript
import { ICommand, ICommandHandler } from "../shared/kernel/cqrs.ts";

// Definir un Command
export class CreateOrderCommand implements ICommand {
    constructor(
        public readonly productId: string,
        public readonly quantity: number
    ) {}
}

// Definir su Handler
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand, Order> {
    async handle(command: CreateOrderCommand): Promise<Order> {
        // Lógica de creación
        return newOrder;
    }
}
```

### IQuery
Marker interface para Queries. Las queries representan lecturas sin efectos secundarios.

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

---

## Domain Types

**Ubicación:** `src/shared/kernel/domain-types.ts`

### Entity
Base class para entidades de dominio. Se identifican por su ID.

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

user1.equals(user2); // true (mismo ID)
```

### ValueObject
Base class para Value Objects. Se identifican por sus propiedades, son inmutables.

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
m1.equals(m2); // true (mismas propiedades)
```

### AggregateRoot
Extiende Entity para soportar Domain Events.

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

// Después de guardar:
const events = order.pullEvents();
// Despachar events a event bus
```

---

## Multi-Tenancy

Ver [multi-region.md](./multi-region.md) para documentación completa.

| Clase | Propósito |
|-------|-----------|
| `RegionId` | Value Object para regiones soportadas |
| `TenantContext` | Contexto del tenant actual (tenantId + regionId) |
| `TenantRegionResolver` | Interface para resolver la región de un tenant |
