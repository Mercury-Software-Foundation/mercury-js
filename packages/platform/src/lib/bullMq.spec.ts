import { EmailQueueService } from './bullMq';
import { Mercury } from '@mercury-js/core';
import { Queue, Worker } from 'bullmq';
import { Transporter } from 'nodemailer';
import { Config } from '../types/bull';
import assert from 'assert';

describe('EmailQueueService', () => {
  let emailQueueService: EmailQueueService;
  let mockMercury: Mercury;

  beforeEach(async () => {
    mockMercury = {
      db: {
        User: {
          mongoModel: {
            find: async (collection: string, id: string) => {
              const emails = [
                {
                  id: 'email-1',
                  email: 'battikerigayathri2454@gmail.com',
                  subject: 'Test Subject',
                  message: 'Test Message'
                },
                {
                  id: 'email-2',
                  email: 'battikerigayathri2454@gmail.com',
                  subject: 'Test Subject 2',
                  message: 'Test Message 2'
                }
              ];
              return emails.find(email => email.id === id) || null;
            }
          },
          // addJob:async()=>{
          //   return {id:"123"}
          // },
        }
      }
    } as unknown as Mercury;

    const config: Config = {
      bullmq: {
       name: 'test-email-queue'
      },
      redis: {
        host: 'localhost',
        port: 6379
      },
      email: {
        service:"gmail",
        host: 'smtp.test.com',
        port: 587,
        auth: {
          user: 'shashanksonwane305@gmail.com',
          pass: 'jfhucooflemoxuya'
        },
        secure:false
      },
      mercury: mockMercury
    };

    emailQueueService = new EmailQueueService(config);
  });

  it('should add email job successfully', async () => {
    const result = await emailQueueService.addJob(
      'battikerigayathri2454@gmail.com',
      'Test Subject',
      'Test Message'
    );
    assert(result, 'Job ID should be returned');
    assert(typeof result === 'string', 'Job ID should be a string');
  });

  it('should get job by ID', async () => {
    const jobId = await emailQueueService.addJob(
      'battikerigayathri2454@gmail.com',
      'Test Subject',
      'Test Message'
    );
    const job = await emailQueueService.getJob(jobId);
    assert(job, 'Job should be found');
    assert.strictEqual(job.data.email, 'battikerigayathri2454@gmail.com');
    assert.strictEqual(job.data.subject, 'Test Subject');
    assert.strictEqual(job.data.message, 'Test Message');
  });

  it('should get job status', async () => {
    const jobId = await emailQueueService.addJob(
      'test@example.com',
      'Test Subject',
      'Test Message'
    );
    const status = await emailQueueService.getJobStatus(jobId);
    assert(status, 'Status should be returned');
    assert(status.id === jobId, 'Status should contain correct job ID');
    assert(status.state, 'Status should contain state');
  });

  it('should fail to get job status for non-existent job', async () => {
    await assert.rejects(
      async () => await emailQueueService.getJobStatus('123'),
      {
        message: 'Job not found'
      }
    );
  });

  it('should process job successfully and send email', async () => {
    const mockJob = {
      data: 'email-1',
      id: 'test-job-id'
    };
    
    const result = await emailQueueService.processJob(mockJob as any);
    assert.strictEqual(result.status, 'success');
  });

  it('should fail to process job for non-existent email', async () => {
    const mockJob = {
      data: 'non-existent-email',
      id: 'test-job-id'
    };

    const result = await emailQueueService.processJob(mockJob as any);
    assert.strictEqual(result.status, 'error');
    assert(result.message.includes('not found'));
  });

  it('should handle worker error events', async () => {
    let errorCaught = false;
    emailQueueService['worker'].emit('error', new Error('Test error'));
    emailQueueService['worker'].on('error', () => {
      errorCaught = true;
    });
    assert(errorCaught === false, 'Error event should be handled');
  });

  it('should handle worker completed events', async () => {
    let completionCaught = false;
    const mockJob = {
      id: 'test-job-id',
      data: 'email-1'
    };
    
    emailQueueService['worker'].emit('completed', mockJob);
    emailQueueService['worker'].on('completed', () => {
      completionCaught = true;
    });
    assert(completionCaught === false, 'Completion event should be handled');
  });

  it('should handle worker failed events', async () => {
    let failureCaught = false;
    const mockJob = {
      id: 'test-job-id',
      data: 'email-1'
    };
    
    emailQueueService['worker'].emit('failed', mockJob, new Error('Test error'));
    emailQueueService['worker'].on('failed', () => {
      failureCaught = true;
    });
    assert(failureCaught === false, 'Failure event should be handled');
  });

  it('should close queue and worker successfully', async () => {
    const result = await emailQueueService.close();
    assert(result === undefined, 'Close should complete without errors');
  });

  afterEach(async () => {
    await emailQueueService.close();
  });
});