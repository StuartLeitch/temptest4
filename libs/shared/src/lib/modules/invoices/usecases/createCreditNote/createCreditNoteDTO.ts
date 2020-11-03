export interface CreateCreditNoteRequestDTO {
  invoiceId?: string;
  createDraft?: boolean;
  reason?: string;
}
