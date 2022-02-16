import {ObjectStoreServiceContract} from "../services/contracts/object-store-service-contract";
import {ArchiveServiceContract} from "../services/contracts/archive-service-contract";

export interface EventHandler<T> {
  handler: (  objectStoreService: ObjectStoreServiceContract, archiveService: ArchiveServiceContract, zipLocation: string) => HandlerFunction<T>;
  event: string;
}

export type HandlerFunction<T> = (data: T) => Promise<void>;
