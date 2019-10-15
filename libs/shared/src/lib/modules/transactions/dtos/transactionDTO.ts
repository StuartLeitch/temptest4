export interface TransactionDTO {
  status: string;
  deleted?: number;
  dateCreated: string | Date;
  dateUpdated: string | Date;
}
