import { ICommand } from '../../../shared/kernel/cqrs.ts';

export class CreateRoleCommand implements ICommand {
    constructor(
        public readonly tenantId: string,
        public readonly name: string,
        public readonly parentRoleId?: string
    ) {}
}
