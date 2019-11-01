import express from 'express';

export function makeExpressServer() {
  const app = express();
  app.get('/api/test', (req, res) => res.status(200).send('asdf'));
  return app;
}
