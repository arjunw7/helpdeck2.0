import { OpenAI } from "openai";
import { StreamingTextResponse, OpenAIStream } from 'ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const COMMAND_PROMPTS = {
  improve: "Improve this text while maintaining its core message:",
  shorten: "Make this text more concise while keeping the key points:",
  expand: "Expand this text with more details and examples:",
  summarize: "Create a brief summary of this text:",
  custom: (prompt: string) => prompt,
};

// System messages for different contexts
const SYSTEM_MESSAGES = {
  changelog: `You are a professional technical writer helping to write change logs.
Your responses should be clear, concise, and follow these guidelines:
- Use a professional and consistent tone
- Focus on technical accuracy and clarity
- Highlight the impact and benefits of changes
- Use proper versioning terminology
- Keep descriptions concise but informative
Use the following formatting:
- Use ## for main headings
- Use ### for subheadings
- Use * for bullet points
- Use > for important notes
Do not use any other markdown or formatting.`,

  documentation: `You are a professional technical writer helping to improve documentation. 
Your responses should be clear, concise, and maintain a professional tone.
Use the following formatting:
- Use ## for main headings
- Use ### for subheadings
- Use * for bullet points
- Use 1. for numbered steps
- Use > for important notes
Do not use any other markdown or formatting and an empty line after every paragraph. Do not add bold or italic inside important notes.`,
};

export async function POST(request: Request) {
  try {
    const { command, selectedText, prompt, context = "documentation" } = await request.json();

    if ((command === "custom" && !prompt) || (command !== "custom" && !selectedText)) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const promptTemplate = command === "custom" 
      ? COMMAND_PROMPTS.custom(prompt)
      : COMMAND_PROMPTS[command as keyof typeof COMMAND_PROMPTS];

    if (!promptTemplate) {
      return new Response(
        JSON.stringify({ error: 'Invalid command' }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const systemMessage = SYSTEM_MESSAGES[context as keyof typeof SYSTEM_MESSAGES] || SYSTEM_MESSAGES.documentation;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: `${promptTemplate}\n\n${selectedText || prompt}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    });

    // Create a stream from the OpenAI response
    const stream = OpenAIStream(response);

    // Return a StreamingTextResponse, which sets the correct headers
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Error generating content:", error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}