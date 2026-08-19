import type { ChatCompletionFunctionTool } from "openai/resources";
import type { Tool, ToolContext } from "./api.js";
import type { Message, Role } from "./types.ts";
import OpenAI from "openai";



export async function callLLM(client: OpenAI, messages: Message[], tools: Tool<unknown, unknown>[]): Promise<Message[]> {


    let hasMoreCalls = true;
    const toolDefs = tools.map((tool) => ({
        type: "function" as const,
        function: {
            name: tool.def.name,
            description: tool.def.description,
            parameters: tool.def.schema,
        },
    }));
    const executes = new Map(
        tools.map((tool) => [
            tool.def.name,
            tool.execute,
        ])
    );

    const newMessages: Message[] = [];
    while (hasMoreCalls) {
        const completion = await client.chat.completions.create({
            model: "qwen-plus",
            messages: [...messages, ...newMessages].map(
                (msg) => ({
                    role: msg.role,
                    content: msg.content,
                    tool_call_id: msg.tool_call_id,
                    reasoning_content: msg.reasoning_content,
                    tool_calls: msg.tool_calls
                }),
            ),
            tools: toolDefs,
            enable_thinking: true,
            thinking_budget: 4096,
        });

        const choice = completion.choices[0];
        console.dir(choice, {
            depth: null,
        });
        const msg = choice.message;
        const content = msg.content;
        const toolCalls = msg.tool_calls;
        newMessages.push({ role: "assistant", content: content ?? "", tool_calls: toolCalls });
        hasMoreCalls = (toolCalls?.length ?? 0) > 0;
        if (toolCalls) {
            for (const toolCall of toolCalls) {
                if (toolCall.type == 'function') {
                    const call = toolCall as ChatCompletionFunctionTool;
                    const name = call.function.name;
                    const args = call.function.arguments;
                    const tool = executes.get(name);
                    const ctx: ToolContext = {};
                    console.log(name, args);
                    if (tool) {
                        const result = await tool(ctx, JSON.parse(args));
                        newMessages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify(result) });
                    } else {
                        newMessages.push({ role: "tool", tool_call_id: toolCall.id, content: `tool ${name} is not found` });
                    }
                }
            }
        }
    }
    return newMessages;
}

