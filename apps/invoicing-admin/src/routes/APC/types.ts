export interface ApcType {
  journalTitle: string;
  journalId: string;
  issn: string;
  publisherId: string;
  amount: string;
}

export interface PublisherType {
  name: string;
}

export interface Item {
  id: string;
  journalId: string;
  journalTitle: string;
  code: string;
  publisher: string;
  publisherId: string;
  issn: string;
  amount: string;
  zeroPriced: string;
}
