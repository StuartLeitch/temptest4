export type JobData<T = unknown> = T;

export interface Job {
  id?: string;
  type: string;
  created: string; // ISO Date String
  data: JobData; // Serializable format
}

export function makeJob(
  type: string,
  data: JobData,
  created: Date = new Date(),
  id?: string
): Job {
  return {
    created: created.toISOString(),
    data,
    type,
    id
  };
}
