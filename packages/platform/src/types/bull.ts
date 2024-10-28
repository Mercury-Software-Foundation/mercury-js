import {Transporter} from "nodemailer"
import {Mercury} from "@mercury-js/core"
import { Job ,Queue} from "bullmq";
export interface EmailJob {
  email: string;
  subject: string;
  message: string;
}
export interface EmailConfig {
  service: string;  
  host: string;    
  port: number;    
  secure: boolean;  
  auth: {
    user: string;
    pass: string;
  };
}
  export interface RedisConfig {
      host: string;
      port: number;
    }
export interface EmailJobResult {
  status: 'success' | 'error';
  message?: string;
}
export interface BullMQConfig {
  name:string
}
export interface JobStatus {
  id: string;
  state: string;
  data: EmailJob;
}
export interface Config {
    mercury: Mercury;
    email: EmailConfig;
    redis: RedisConfig;
    bullmq: BullMQConfig;
}
export interface IBullMq{
  addJob(email: string, subject: string, message: string): Promise<string>;
  getJob(jobId: string): Promise<Job<EmailJob> | undefined>;
  close(): Promise<void>;
  sendEmail(email: string, subject: string, message: string): Promise<string>;
  getJobStatus(jobId: string): Promise<JobStatus>;
}