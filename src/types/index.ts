export interface ConfigItem {
  OLLAMA_HOST: string;
  OLLAMA_MODEL: string;
}

export interface UserSelection {
  framework: string;
  languageType: string;
  cssOption: string;
  userInput: string;
}

export type CustomHooksSelection = Omit<UserSelection, 'cssOption'>;

export interface Staged {
  filename: string;
  content: string;
}

export * from "./ollama"


