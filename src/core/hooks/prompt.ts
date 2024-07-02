import { CustomHooksSelection } from '@/types';

export const generatorComponentPrompt = ({
  framework,
  languageType,
  userInput,
}: CustomHooksSelection): string => {
  return `
  Please generate a custom Hook based on the following information:

  Framework: ${framework}
  Programming Language: ${languageType}

  Description: ${userInput}

  Requirements:
  1. Provide a complete code implementation.
  2. Include Hook definition and state management (if applicable).
  3. Add TypeDoc comments, but do not include usage examples.
  4. Ensure the generated code passes TypeScript type checks.
  5. Only return the custom Hook function, do not return usage examples.
  `;
};
