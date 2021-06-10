import { join } from 'path';

export function getOsEnv(key: string): string {
  if (typeof process.env[key] === 'undefined') {
    throw new Error(`Environment variable ${key} is not set.`);
  }

  return process.env[key] as string;
}

export function nonEmptyOsEnv(key: string) {
  const value = getOsEnv(key);
  if (!value) {
    throw new Error(`Value of environment variable ${key} is an empty string.`);
  }
  return value;
}

export function getOsEnvOptional(key: string): string | undefined {
  return process.env[key];
}

export function getOsEnvWithDefault(key: string, defaultValue = ''): string {
  return getOsEnvOptional(key) || defaultValue;
}

export function getPath(path: string): string {
  return join(process.cwd(), path);
}

export function getPaths(paths: string[]): string[] {
  return paths.map((p) => getPath(p));
}

export function getOsPath(key: string): string {
  return getPath(getOsEnv(key));
}

export function getOsEnvArray(key: string, delimiter = ','): string[] {
  return (process.env[key] && process.env[key].split(delimiter)) || [];
}

export function getOsPaths(key: string): string[] {
  return getPaths(getOsEnvArray(key));
}

export function toNumber(value: string): number {
  return parseInt(value, 10);
}

export function toFloat(value: string): number {
  return parseFloat(value);
}

export function toBool(value: string): boolean {
  return value === 'true';
}

export function toArray(value: string, delimiter = ','): string[] {
  return (value && value.split(delimiter)) || [];
}

export function toObject(value: string): any {
  return JSON.parse(value);
}

export function normalizePort(port: string): number | string | boolean {
  const parsedPort = parseInt(port, 10);
  if (isNaN(parsedPort)) {
    // named pipe
    return port;
  }
  if (parsedPort >= 0) {
    // port number
    return parsedPort;
  }
  return false;
}

export function toObject(value: string): any {
  return JSON.parse(value);
}
