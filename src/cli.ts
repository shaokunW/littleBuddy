import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from "node:process";
import OpenAI from "openai";
import type { Message, Role } from "./types.ts";
import { callLLM } from "./agent.js";
const client = new OpenAI({
  apiKey: process.env.XXXX,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

const rl = readline.createInterface({ input, output });

const message = (role: Role, content: string): Message => ({ role, content });
const messages: Message[] = [];
messages.push(message("system", "You are a helpful assistant."));

while (true) {
  const usrMsg = (await rl.question("你: ")).trim();
  messages.push(message("user", usrMsg))
  try {
    const msg =  await callLLM(client, messages);
    console.log(`littleBuddy: ${msg.content}\n`);
    messages.push(msg);
  } catch (e) {
    console.error(`出错: ${(e as Error).message}\n`);
  }
}