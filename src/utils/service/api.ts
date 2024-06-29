import { ChatRequest, ChatResponse } from "@/types";
import { axiosGet, axiosPost } from "./request";
enum EndpointEnum {
  CHAT = "chat",
}
export const ollamaChatApi = async <RES = any, REQ = any>(
  data: REQ
): Promise<RES> =>
  axiosPost<RES, REQ>(`/api/${EndpointEnum.CHAT}`, data);
