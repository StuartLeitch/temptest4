import express from 'express';
import { Context } from '@hindawi/invoicing-graphql/context';
import { AuthContext } from '@hindawi/invoicing-graphql/services';
import { Request, Response } from 'express';

export class AuthMiddleware {
  constructor(private context: Context) {
  }

  public parse(): express.Handler  {
    return async (req, res, next) => {
      const token = this.extractToken(req);
      let auth: AuthContext;

      if (token) {
        auth = await this.context.authService.parse(token);
      }

      if (auth) {
        req.auth = auth;
      }

      return next();
    };
  }

  public enforce(): express.Handler {
    return (req, res, next) => {
      if (!req.auth) {
        return next(new Error('No authentication found'));
      }

      next();
    };
  }

  private extractToken(req: Request) {
    const header = req.get('authorization');
    const [authType, token] = header.split(' ');

    if (authType.toLowerCase() === 'bearer') {
      return token;
    }

    return null;
  }
}
