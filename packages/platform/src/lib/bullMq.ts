import { Transporter, createTransport } from 'nodemailer';
import { Mercury } from '@mercury-js/core';
import { Job, Queue, Worker } from 'bullmq';
import {
  EmailJob,
  EmailJobResult,
  JobStatus,
  Config,
  IBullMq,
} from '../types';
import { log } from 'console';

export class EmailQueueService implements IBullMq {
  private queue: Queue<EmailJob>;
  private config: Config;
  private worker: Worker<EmailJob, EmailJobResult>;
  private core: Mercury;
  private transporter: Transporter;
  constructor(config: Config) {
    this.config = config;
    this.core = config.mercury;
    this.queue = new Queue<EmailJob>(config.bullmq.name, {
      connection: config.redis,
    });
    this.transporter = createTransport(config.email);
    this.worker = new Worker<EmailJob, EmailJobResult>(
      this.queue.name,
      (job) => this.processJob(job),
      { connection: config.redis }
    );
    this.setupWorkerListeners();
  }
  async addJob(email: string, subject: string, message: string): Promise<any> {
    console.log({ email, subject, message }, 'user');
    const job = await this.queue.add('sendEmail', { email, subject, message });
    console.log(`✅ Email job added with ID: ${job.id}`);
    return job.id;
  }
  async getJob(jobId: string): Promise<Job<EmailJob> | undefined> {
    console.log(jobId,"JobId");
    // console.log(this.queue.getJob(jobId));
    return await this.queue.getJob(jobId);
  }
  async getJobStatus(jobId: string): Promise<JobStatus> {
    // console.log(jobId, 'JobId');
    const job = await this.getJob(jobId);
    console.log(job, 'job');
    if (!job) throw new Error('Job not found');
    const state = await job.getState();
    return { id: job.id, state: state || 'unknown', data: job.data };
  }
 async sendEmail(email: string, subject: string, message: string): Promise<any> {
        try {
          const data= await this.sendEmail(email, subject, message);
          console.log(data,` ✉  Email Sent SuccessFully To ${email}`);
          return data;
        } catch (error) {
          console.error('Email service error:', error);
          throw error;
        }
      }
  async processJob(job: Job<EmailJob>): Promise<EmailJobResult> {
    // try {
    //   const { email, subject, message } = job.data;

    //   await this.transporter.sendMail({
    //     from: this.transporter.options.auth.user,
    //     to: email,
    //     subject,
    //     text: message,
    //   });

    //   console.log(✅ Email sent to ${email});
    //   return { status: 'success' };
    // } catch (error: any) {
    //   console.error(
    //     ❌ Failed to send email to ${job.data.email}: ${error.message}
    //   );
    //   return { status: 'error', message: error.message };
    // }
    try {
      const emailId = job.data;
      const emailRecord = await this.core.db['User'].mongoModel.find(
        'email',
        emailId
      );
      console.log(emailRecord,"emailRecord");
      
      if (!emailRecord) {
        throw new Error(`Email with ID ${emailId} not found`);
      }
      const data=await this.transporter.sendMail({
        from: this.transporter.options.auth.user,
        to: emailRecord.email,
        subject:emailRecord.subject,
        text: emailRecord.message,
      });
      console.log(data,"data");
      

      console.log(`✅ Email sent to ${emailRecord.email}`);
      return { status: 'success' };
    } catch (error: any) {
      console.error(`❌ Failed to send email: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }
  private setupWorkerListeners(): void {
    this.worker.on('completed', (job) => {
      console.log(`✅ Job ${job.id} completed successfully`);
    });

    this.worker.on(
      'failed',
      (job: Job<EmailJob, EmailJobResult, string> | any, err: any) => {
        console.error(`❌ Job ${job.id} failed: ${err.message}`);
      }
    );

    this.worker.on('error', (error: Error) => {
      console.error('❌ Worker error:', error);
    });
  }
  async close(): Promise<void> {
    await this.queue.close();
    await this.worker.close();
    console.log('🚪 Queue and worker closed.');
  }
}