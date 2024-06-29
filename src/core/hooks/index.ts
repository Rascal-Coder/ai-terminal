import { outro, spinner } from "@clack/prompts";
import { marked } from "marked";
import path from "path";
import fs from "fs/promises"; // 使用异步的文件系统操作

import { getUserInput } from "./select";
import { generatorComponentPrompt } from "./prompt";

import { validateFileName } from "@/utils";
import { CustomHooksSelection, ChatRequest, ChatResponse } from "@/types";
import { ollamaChatApi } from "@/utils/service/api";

interface CodeBlocks {
  [key: string]: string[];
}
async function getOpenAIResponse(prompts: string) {
  const data = {
    model: "deepseek-coder-v2:latest",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that generates custom hooks.",
      },
      {
        role: "user",
        content: prompts,
      },
    ],
    stream: false,
    options: {
      top_p: 0.7,
      temperature: 0.7,
    },
  };
  const res = await ollamaChatApi<ChatResponse, ChatRequest>(data);
  return res.message.content;
}

function parseCompletionToCodeBlocks(completion: string): CodeBlocks {
  const tokens = marked.lexer(completion);
  const result: CodeBlocks = {};

  tokens.forEach((token) => {
    if (token.type === "code") {
      const lang = token.lang || "plaintext";
      if (!result[lang]) {
        result[lang] = [];
      }
      result[lang].push(token.text);
    }
  });

  return result;
}

async function writeCodeBlocksToFile(
  result: CodeBlocks,
  outputDir: string,
  fileName: string,
  prefix: string
) {
  await fs.mkdir(outputDir, { recursive: true });

  for (const [_, value] of Object.entries(result)) {
    const filePath = path.join(outputDir, `${fileName}.${prefix}`);
    await fs.writeFile(filePath, value.join("\n\n"), "utf8");
  }
}

export default async function generatorHooks(fileName: string) {
  try {
    await validateFileName(fileName);

    const input = (await getUserInput()) as CustomHooksSelection;
    const prompts = generatorComponentPrompt(input);

    const promptsSpinner = spinner();
    promptsSpinner.start("AI is generating hooks for you");

    const completion = await getOpenAIResponse(prompts);
    const result = parseCompletionToCodeBlocks(completion);

    const finalComponentPath = "./src/hooks";
    const outputDir = path.join(process.cwd(), finalComponentPath);
    const prefix =
      input.framework === "Vue"
        ? "Vue"
        : input.framework === "React" && input.languageType === "TypeScript"
        ? "tsx"
        : "jsx";

    await writeCodeBlocksToFile(result, outputDir, fileName, prefix);

    promptsSpinner.stop();
    outro("Hooks creation complete 🎉🎉🎉");
  } catch (error) {
    console.error(error);
  }
}
