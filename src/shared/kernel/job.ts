/**
 * Interface representing a background job.
 */
export interface IJob {
    /**
     * Unique identifier for the job type/handler.
     */
    type: string;

    /**
     * Job payload data.
     */
    payload: Record<string, any>;
}

/**
 * Interface for Job Handlers.
 */
export interface IJobHandler<T extends IJob> {
    /**
     * Process the job.
     */
    handle(job: T): Promise<void>;
}

/**
 * Interface for the Job Repository (Outbox/Queue interaction).
 */
export interface IJobRepository {
    enqueue(job: IJob, delayMinutes?: number): Promise<void>;
}
