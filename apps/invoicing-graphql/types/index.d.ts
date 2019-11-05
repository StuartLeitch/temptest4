declare namespace Express {
  export interface Request {
    auth: import('../src/services').AuthContext;
  }
}

