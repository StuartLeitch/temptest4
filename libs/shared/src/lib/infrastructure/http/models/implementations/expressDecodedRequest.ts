import express from 'express';

export interface DecodedExpressRequest extends express.Request {
  decoded: any;
}
