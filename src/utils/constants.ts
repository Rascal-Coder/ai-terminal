export const CONFIG_FILE_NAME = 'ai_terminal.config.json';
export const OPENAI_CHAT_COMPLETIONS_ENDPOINT = '/api/chat';
export const OLLAMA_MODEL = 'ollama_models.json';
export const DOWNLOAD_URLS: Record<string, string> = {
  win32: 'https://ollama.com/download/OllamaSetup.exe',
  darwin: 'https://ollama.com/download/Ollama-darwin.zip',
};

export const CHAT_OPTIONS = {
  top_p: 0.9, // 提高文本的多样性
  temperature: 0.6, // 降低温度以增加结果的确定性
  num_predict: 300, // 增加预测的最大token数量，以确保生成完整代码
  repeat_penalty: 1.2, // 提高重复惩罚以减少重复内容
  top_k: 50, // 适度降低top_k值以减少无关内容
};
