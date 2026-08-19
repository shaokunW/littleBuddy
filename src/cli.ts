import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from "node:process";
import OpenAI from "openai";
import type { Message, Role } from "./types.ts";
import { callLLM } from "./agent.js";
import type { RegistryAPI, Tool, ToolDefinition } from './api.js';
import bash from './tools/bash.js';
const client = new OpenAI({
  apiKey: process.env.XXXX,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

const rl = readline.createInterface({ input, output });
const tools: Tool<unknown, unknown>[] = [];
const message = (role: Role, content: string): Message => ({ role, content });
const messages: Message[] = [];

const registryAPI: RegistryAPI = {
    registerTool: (tool) => {tools.push(tool)}
};
bash(registryAPI);

messages.push(message("system", "You are a helpful assistant."));

while (true) {
  const usrMsg = (await rl.question("你: ")).trim();
  messages.push(message("user", usrMsg))
  try {
    const newMessages = await callLLM(client, messages, tools);
    for (const msg of newMessages) {
      console.log(`littleBuddy: ${msg.content}\n`);
      messages.push(msg);
    }
  } catch (e) {
    console.error(`出错: ${(e as Error).message}\n`);
  }
}