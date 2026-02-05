import { ILogTransport, LogEntry } from "../log-types.ts";

export class ConsoleTransport implements ILogTransport {
    public log<T>(entry: LogEntry<T>): void {
        const color = this.getColor(entry.severity);
        const reset = "\x1b[0m";
        const kindTag = entry.kind ? ` [${entry.kind.toUpperCase()}]` : "";

        console.log(`${color}[${entry.severity.toUpperCase()}]${reset}${kindTag} [${entry.code}] ${entry.message}`);
    }

    private getColor(severity: string): string {
        switch (severity) {
            case 'error':
            case 'fatal':
                return "\x1b[31m"; // Red
            case 'warn':
                return "\x1b[33m"; // Yellow
            case 'debug':
                return "\x1b[34m"; // Blue
            case 'custom':
                return "\x1b[35m"; // Magenta
            default:
                return "\x1b[32m"; // Green (Info/default)
        }
    }
}
