
import { format } from "https://deno.land/std@0.208.0/datetime/mod.ts";
import { ensureDir } from "https://deno.land/std@0.208.0/fs/ensure_dir.ts";
import { join } from "https://deno.land/std@0.208.0/path/mod.ts";
import { ILogTransport, LogEntry, LogSeverity } from "../log-types.ts";

const LOG_STORAGE_PATH = "./storage/logs";

const RETENTION_DAYS: Record<LogSeverity, number> = {
    'debug': parseInt(Deno.env.get("LOG_RETENTION_DEBUG") || "30"),
    'info': parseInt(Deno.env.get("LOG_RETENTION_INFO") || "45"),
    'warn': parseInt(Deno.env.get("LOG_RETENTION_WARN") || "60"),
    'error': parseInt(Deno.env.get("LOG_RETENTION_ERROR") || "75"),
    'fatal': parseInt(Deno.env.get("LOG_RETENTION_FATAL") || "90"),
    'custom': 30
};

export class FileTransport implements ILogTransport {

    constructor() {
        this.scheduleCleanup();
    }

    public async log<T>(entry: LogEntry<T>): Promise<void> {
        try {
            const dateStr = format(new Date(), "yyyy-MM-dd");
            // Simplified Path: logs/{severity}/{date}.log
            const dirPath = join(LOG_STORAGE_PATH, entry.severity);
            const filePath = join(dirPath, `${dateStr}.log`);

            await ensureDir(dirPath);
            await Deno.writeTextFile(filePath, JSON.stringify(entry) + "\n", { append: true });
        } catch (err) {
            console.error("FATAL: FileTransport failed to write log", err);
        }
    }

    private scheduleCleanup() {
        if (Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined || Deno.args.includes("--unstable-cron")) {
            Deno.cron("Log Retention Cleanup", "0 0 * * *", () => {
                this.cleanLogs();
            });
        }
    }

    /**
     * Cleans up logs based on severity retention policies.
     * Iterates explicitly through known severity folders.
     */
    public async cleanLogs() {
        console.log("Starting Log Retention Cleanup...");
        try {
            // Iterate known severities to avoid trawling unknown types if they existed
            const severities: LogSeverity[] = ['debug', 'info', 'warn', 'error', 'fatal', 'custom'];

            for (const severity of severities) {
                const severityPath = join(LOG_STORAGE_PATH, severity);
                
                // Skip if directory doesn't exist
                try {
                    await Deno.lstat(severityPath);
                } catch {
                    continue;
                }

                const retentionDays = RETENTION_DAYS[severity] || 30;
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
                cutoffDate.setHours(0,0,0,0);

                for await (const logFile of Deno.readDir(severityPath)) {
                    if (!logFile.isFile || !logFile.name.endsWith(".log")) continue;
                    
                    const datePart = logFile.name.replace(".log", "");
                    const logDate = new Date(datePart); // "YYYY-MM-DD" fits ISO format partially but works with Date constructor usually.
                    // Better to parse manually? "YYYY-MM-DD" is parseable by JS Date (UTC usually). 
                    // To be safe, let's treat it as local Date if needed, but standard Date parse assumes UTC for "YYYY-MM-DD" often.
                    // Actually new Date("2023-01-01") is UTC. Local filenames represent local days usually.
                    // Let's assume standard parsing is sufficient for retention "older than X days" logic.
                    
                    if (logDate.getTime() < cutoffDate.getTime()) {
                        const filePath = join(severityPath, logFile.name);
                        await Deno.remove(filePath);
                        console.log(`Deleted expired log: ${filePath} (Older than ${retentionDays} days)`);
                    }
                }
            }
            console.log("Log Retention Cleanup Completed.");
        } catch (error) {
            console.error("Error during log cleanup:", error);
        }
    }
}
