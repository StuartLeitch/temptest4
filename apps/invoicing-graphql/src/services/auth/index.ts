import { Config } from '@hindawi/invoicing-graphql/config';
import jwt from 'jsonwebtoken';

// @TODO fetch this from keycloak at run-time
const PUBLIC_KEY =
`-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhIMUjeULMkAAky57vRW2pX7hH7Ib9/vi6q1GvhsFIhFUQQ3tNVv4Hg6xUyUtoAvwKLSL6rSoSPTdPYXGcQpiepLu2qN6r2Lj/bbc92T5JftEyYRLZ/awc/hbotXcild+o22ei46qFFCgxhB+05ANBMkrxRgw6te4j76RY2xLGyQKQNEFHSWKsDB8jE9nvT8SW3+h61H7DDkbX5eiQao9Hl14xVxjKYqYMxkXBhQTUes/hCoFuvNQrlQnFUjzP+8bx022S00mbc51/NpYKH/peH+rH5zQyjlT5H0nuPjsKt3xSOsTKEUaPkU12fIh0fUBbAWI8+IeZI5oNcljKo7m0QIDAQAB
-----END PUBLIC KEY-----`;

export interface AuthContext {
  user: string;
  email: string;
  roles: string[];
}

interface TokenData {
  email: string;
  username: string;
  resource_access: {
    phenom: {
      roles: string[];
    };
  };

}

export class AuthService {
  constructor(private config: Config) {
  }

  async parse(token: string): Promise<AuthContext> {
    const payload = jwt.verify(token, PUBLIC_KEY) as TokenData;
    return {
      user: payload.username,
      email: payload.email,
      roles: payload.resource_access.phenom.roles,
    };
  }
}
