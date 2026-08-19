export type Role = "system" | "user" | "assistant" | "tool";

export type Message = {
  role: Role;
  content?: string;
  reasoning_content?: string;
  tool_calls?: unknown;
  tool_call_id?: string;
};