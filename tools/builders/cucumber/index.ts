import { SchemaObject as TimestampBuilderSchema } from './schema';
import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import execa from 'execa';
import { Observable, bindNodeCallback, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { getSystemPath, normalize, json } from '@angular-devkit/core';
import { writeFile } from 'fs';
import * as dateFormat from 'dateformat';

export function createTimestamp(
  { path, format }: TimestampBuilderSchema,
  { workspaceRoot, logger }: BuilderContext
): Observable<BuilderOutput> {
  const timestampFileName = `${getSystemPath(
    normalize(workspaceRoot)
  )}/${path}`;
  const writeFileObservable = bindNodeCallback(writeFile);
  const subprocess = execa_1(
    path_1.join('node_modules', '.bin', 'cucumber-js'),
    [options.features], // '--require', supportEntryPath]
    { env: { TS_NODE_PROJECT: options.tsConfig } }
  );
  const timestampLogger = logger.createChild('Timestamp');
  return writeFileObservable(
    timestampFileName,
    dateFormat(new Date(), format)
  ).pipe(
    map(() => ({ success: true })),
    tap(() => timestampLogger.info('Timestamp created')),
    catchError((e) => {
      timestampLogger.error('Failed to create timestamp', e);
      return of({ success: false });
    })
  );
}

export default createBuilder<json.JsonObject & TimestampBuilderSchema>(
  createTimestamp
);
