import { ICommand } from '../../../shared/kernel/cqrs.ts';

export class LoginCommand implements ICommand {
    constructor(
        public readonly email: string,
        public readonly password: string,
        public readonly slug: string
    ) {}
}
