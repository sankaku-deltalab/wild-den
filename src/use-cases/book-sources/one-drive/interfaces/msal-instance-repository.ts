import { MsalInstanceType } from "../types";

export interface MsalInstanceRepository {
  get(): MsalInstanceType;
}
