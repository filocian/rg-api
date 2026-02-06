import { IJob, IJobHandler } from "../../kernel/job.ts";
import { AppError } from "../errors/app-error.ts";
import { ILogger } from "../logging/log-types.ts";
import { logger as defaultLogger } from "../logging/logger.ts";
import { jobRepository } from "./job.repository.ts";

export class JobWorker {
    private handlers = new Map<string, IJobHandler<any>>();
    private isRunning = false;
    private timer?: number;

    constructor(
        private logger: ILogger = defaultLogger,
        private repository = jobRepository,
        private pollIntervalMs: number = 1000,
        private batchSize: number = 5
    ) {}

    /**
     * Registers a handler for a specific job type.
     */
    register<T extends IJob>(type: string, handler: IJobHandler<T>) {
        this.handlers.set(type, handler);
    }

    /**
     * Starts the worker polling loop.
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.logger.info("JOB_WORKER_START", "Starting job worker...");
        this.loop();
    }

    /**
     * Stops the worker.
     */
    stop() {
        this.isRunning = false;
        if (this.timer) clearTimeout(this.timer);
        this.logger.info("JOB_WORKER_STOP", "Stopped job worker.");
    }

    private async loop() {
        if (!this.isRunning) return;

        try {
            const jobs = await this.repository.poll(this.batchSize);

            if (jobs.length > 0) {
                // Process in parallel
                await Promise.allSettled(jobs.map(job => this.processJob(job)));
                
                // If we found jobs, poll again immediately (drain queue)
                setTimeout(() => this.loop(), 0); 
                return;
            }
        } catch (error) {
            const appError = AppError.normalize(error);
            this.logger.error("JOB_WORKER_ERROR", "Error polling jobs", appError);
        }

        // No jobs or error -> sleep
        this.timer = setTimeout(() => this.loop(), this.pollIntervalMs);
    }

    private async processJob(job: any) {
        const handler = this.handlers.get(job.type);

        if (!handler) {
            this.logger.error(`JOB_HANDLER_MISSING`, `No handler for job type: ${job.type}`);
            // Mark as failed so it doesn't get stuck forever (or implement DLQ logic)
            await this.repository.fail(job.id, "No handler registered"); 
            return;
        }

        try {
            await handler.handle(job);
            await this.repository.complete(job.id);
            // Optional: this.logger.info("JOB_COMPLETE", `Processed job ${job.id}`);
        } catch (error: any) {
            const appError = AppError.normalize(error);
            this.logger.error(`JOB_FAILED`, `Job ${job.id} failed`, appError);
            await this.repository.fail(job.id, appError.message);
        }
    }
}

export const jobWorker = new JobWorker();
