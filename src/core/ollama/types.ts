import { ModelResponse } from "@/types";
export type Model = { name: string; type: string };
export type Models = Model[];
export interface GroupedData {
  [key: string]: ModelResponse[];
}
