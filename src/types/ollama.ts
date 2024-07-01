export interface Message {
  role: string;
  content: string;
  images?: Uint8Array[] | string[];
}

export interface ChatResponse {
  model: string;
  created_at: Date;
  message: Message;
  done: boolean;
  done_reason: string;
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
}

export interface ListResponse {
  models: ModelResponse[];
}

export interface ModelResponse {
  name: string;
  modified_at: Date;
  size: number;
  digest: string;
  details: ModelDetails;
  expires_at: Date;
  size_vram: number;
}

export interface ModelDetails {
  parent_model: string;
  format: string;
  family: string;
  families: string[];
  parameter_size: string;
  quantization_level: string;
}
export interface ChatRequest {
  model: string;
  messages?: Message[];
  stream?: boolean;
  format?: string;
  keep_alive?: string | number;

  options?: Partial<Options>;
}

export interface Options {
  numa: boolean;
  num_ctx: number;
  num_batch: number;
  num_gpu: number;
  main_gpu: number;
  low_vram: boolean;
  f16_kv: boolean;
  logits_all: boolean;
  vocab_only: boolean;
  use_mmap: boolean;
  use_mlock: boolean;
  embedding_only: boolean;
  num_thread: number;

  // Runtime options
  num_keep: number;
  seed: number;
  num_predict: number;
  top_k: number;
  top_p: number;
  tfs_z: number;
  typical_p: number;
  repeat_last_n: number;
  temperature: number;
  repeat_penalty: number;
  presence_penalty: number;
  frequency_penalty: number;
  mirostat: number;
  mirostat_tau: number;
  mirostat_eta: number;
  penalize_newline: boolean;
  stop: string[];
}
