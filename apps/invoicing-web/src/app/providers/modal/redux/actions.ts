import { createCustomAction } from "typesafe-actions";

export const showModal = createCustomAction("modal/SHOW");
export const hideModal = createCustomAction("modal/HIDE");
