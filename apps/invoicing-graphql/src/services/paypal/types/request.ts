type Verb = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface PayPalRequest {
  headers: Record<string, unknown>;
  body: Record<string, unknown>;
  path: string;
  verb: Verb;
}

export enum ResponsePrefer {
  REPRESENTATION = 'return=representation',
  MINIMAL = 'return=minimal',
}
