export interface ConfigItem {
  END_POINT: string;
  USE_OLLAMA_MODEL: string;
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

export type UnionFromArray<T extends readonly any[]> = T[number];
