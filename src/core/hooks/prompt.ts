import { CustomHooksSelection } from '@/types';

export const generatorComponentPrompt = ({
  framework,
  languageType,
  userInput,
}: CustomHooksSelection): string => {
  return `
  请根据以下信息生成一个自定义的 Hook：

  框架：${framework}
  编程语言：${languageType}

  描述：${userInput}

  要求：
  1. 提供完整的代码实现。
  2. 包含 Hook 定义和状态管理（如果适用）。
  3. 添加 TypeDoc 注释，但不包括使用示例。
  4. 确保生成的代码能够通过 TypeScript 的类型检查。
  5. 最后只返回自定义 Hook 方法，不需要返回该 Hook 的使用示例。
    `;
};

//  { generatorComponentPrompt };
