import { any } from "prop-types";

declare module "*.css";
declare module "*.png";

declare interface Window {
  _env_: any;
}

declare const process: any;

declare interface Object {
  entries: any;
}
