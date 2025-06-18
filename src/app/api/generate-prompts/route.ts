import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function GET() {
  try {
    const { text } = await generateText({
      model: openai("gpt-4-turbo"),
      prompt: `You are a helpful assistant. Your task is to generate four distinct, engaging, and common questions a user might ask a tech expert. These questions should be general in nature and cover a range of popular consumer electronics like laptops, smartphones, PCs, and tablets. The questions should be concise and ready to be displayed on buttons.

Return ONLY a valid JSON array of four strings.

Example:
[
  "What's the best laptop for a college student on a budget?",
  "Should I switch from iPhone to Android this year?",
  "Help me choose parts for a new gaming PC build.",
  "Is a tablet powerful enough to replace my laptop for work?"
]`,
    });

    // Validate and parse the JSON response
    const prompts = JSON.parse(text);
    if (
      Array.isArray(prompts) &&
      prompts.length === 4 &&
      prompts.every((p) => typeof p === "string")
    ) {
      return NextResponse.json(prompts);
    } else {
      throw new Error("Invalid response format from AI.");
    }
  } catch (error) {
    console.error("Error generating dynamic prompts:", error);
    // Provide a fallback list of questions if the AI fails
    const fallbackPrompts = [
      "I need a laptop for college under $800",
      `What's the best gaming laptop in ${new Date().getFullYear()}?`,
      "Should I buy an iPhone or an Android?",
      "Help me build a PC for video editing",
    ];
    return NextResponse.json(fallbackPrompts, { status: 500 });
  }
}
