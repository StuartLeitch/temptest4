import { S3 } from 'aws-sdk';
import { Event } from '../../../../modules/event';
import { Selector } from '../../../selector';
import { Filter } from '../../../filters';
import { Producer } from '../../producer';
export declare class S3EventProducer implements Producer<Event, string> {
    private defaultValues;
    private selectors;
    private filters;
    private bucketName;
    private s3;
    constructor(s3: S3, bucketName: string);
    produce(): AsyncGenerator<Event, void, undefined>;
    setDefaultValues(base: Partial<Event>): void;
    addFilter(filter: Filter<Event>): void;
    removeFilters(): void;
    addSelector(selector: Selector<string>): void;
    removeSelectors(): void;
    private checkFilters;
    private checkSelectors;
    private getS3ObjectKeys;
    private getS3Object;
    private listObjects;
}
