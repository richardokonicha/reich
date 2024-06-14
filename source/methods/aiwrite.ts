import { TaskMessage, TaskResult } from 'auto-playwright/dist/types';
import OpenAI from 'openai';
import { Page, Locator } from 'playwright';
import sanitize from 'sanitize-html';
import { createActions } from './createActions';
import { prompt } from './prompt';
import { ChatCompletionMessageParam } from 'openai/resources';
import sanitizeHtml from 'sanitize-html';


export async function aiWrite(task: string, locator: Locator): Promise<TaskResult> {
  const domContent = await locator.innerHTML();
  const sanitizedContent = sanitizeHtml(domContent);
  const snapshot = { dom: sanitizedContent };

  const openai = new OpenAI();

  let lastFunctionResult: null | { errorMessage?: string; query?: string } = null;

  const actions = createActions(locator.page());

  const runner = openai.beta.chat.completions
    .runTools({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt({ task, snapshot }) }],
      tools: Object.values(actions).map((action) => ({
        type: "function",
        function: action,
      })),
    //   response_format: { "type": "json_object" }
    })
    .on("message", (message: ChatCompletionMessageParam) => {
      console.log("> message", message);
      if (
        message.role === "assistant" &&
        message.function_call?.name.startsWith("result")
      ) {
        lastFunctionResult = JSON.parse(message.function_call.arguments);
      }
    });

  const finalContent = await runner.finalContent();
  console.log("> finalContent", finalContent);

  if (!lastFunctionResult) {
    throw new Error("Expected to have result");
  }

  console.log("> lastFunctionResult", lastFunctionResult);

  return lastFunctionResult as TaskResult;
}

