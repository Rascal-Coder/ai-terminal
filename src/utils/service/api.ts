import { ChatRequest, ChatResponse, ListResponse } from "@/types";
import { axiosGet, axiosPost } from "./request";
enum EndpointEnum {
  CHAT = "chat",
  Model = "tags",
}
export const ollamaChatApi = async (data: ChatRequest) =>
  axiosPost<ChatResponse, ChatRequest>(`/api/${EndpointEnum.CHAT}`, data);
export const ollamaModelApi = async () =>
  axiosGet<ListResponse>(`/api/${EndpointEnum.Model}`);
