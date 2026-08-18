import type { Message, Role } from "./types.ts";
import OpenAI from "openai";



export async function callLLM(client: OpenAI, messages: Message[]): Promise<Message> {
    const completion = await client.chat.completions.create({
        model: "qwen-plus",
        messages,
    });
    const msg = completion.choices[0].message;
    return {
        role: msg.role,
        content: msg.content ?? ""
    }
}

