export type JobData = any;

export interface Job {
  id?: string;
  type: string;
  created: string; // ISO Date String
  data: JobData; // Serializable format
}
