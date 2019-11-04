import Axios from "axios-observable";

import { config } from "../config";

const NETWORK_TIMEOUT = 10000;

const gqlAdapter = Axios.create({
  baseURL: config.gqlRoot,
  timeout: NETWORK_TIMEOUT,
});

const restAdapter = Axios.create({
  baseURL: config.apiRoot,
  timeout: NETWORK_TIMEOUT,
});

export { gqlAdapter, restAdapter };
