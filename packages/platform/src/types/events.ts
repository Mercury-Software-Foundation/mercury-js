export interface IEventConfig {
  globalConcurrency: number;
  maxRetry: number;
  retryDelay: number;
}

export interface IQueueJob<T> {
  id: string;
  data: T;
  status: 'pending' | 'completed' | 'failed' | 'retrying';
  retries: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQueue<T> {
  name: string;
  jobs: IQueueJob<T>[];
  worker: (handler: (params: any) => Promise<void>) => Promise<void>;
  addJob: (job: IQueueJob<T>) => Promise<void>;
  getJob: () => Promise<IQueueJob<T>>;
  removeJob: (jobId: string) => Promise<IQueueJob<T>>;
  retryJob: (jobId: string) => Promise<IQueueJob<T>>;
  getJobById: (jobId: string) => Promise<IQueueJob<T>>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  getJobCount: () => Promise<number>;
  getCompletedJobCount: () => Promise<number>;
  getFailedJobCount: () => Promise<number>;
  scheduleJob: (job: IQueueJob<T>, cron: string) => Promise<void>;
}

export interface IEvent {
  run: (params: any) => Promise<void>;
  init: (params: any) => Promise<void>;
  config: IEventConfig;
  createQueue: <T>(name: string) => Promise<IQueue<T>>;
  deleteQueue: (name: string) => Promise<void>;
}
