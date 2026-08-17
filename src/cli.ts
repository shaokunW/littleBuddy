import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from "node:process";
import { loop } from "./agent.js"
import { readlink } from "node:fs";

const rl = readline.createInterface({input, output});

export function echo(text: string): string {
  const swapped = text
    .replace(/我/g, "__ME__")
    .replace(/你/g, "我")
    .replace(/__ME__/g, "你");
  return swapped.replace(/[。！？!?]+$/, "") + "？";
}

while (true) {
    const input = (await rl.question("你: ")).trim();
    try {
        console.log(`littleBuddy: ${await echo(input)}\n`);
    } catch (e) {
        console.error(`出错: ${(e as Error).message}\n`);   // 崩了也不退出
    }
}