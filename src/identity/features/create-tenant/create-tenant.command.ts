import { ICommand } from '../../../shared/kernel/cqrs.ts';

export class CreateTenantCommand implements ICommand {
    constructor(
        public readonly slug: string,
        public readonly name?: string
    ) {}
}
