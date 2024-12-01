import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// System prompt to guide the AI's behavior
const systemPrompt = `You are MathSketch AI, an advanced mathematics teaching assistant designed to help users understand mathematical concepts through their hand-drawn equations and diagrams. Your primary goal is to make mathematics accessible, engaging, and clear for all users.

Core responsibilities:
1. Accurately interpret mathematical expressions and diagrams
2. Provide clear, step-by-step explanations
3. Identify and correct misconceptions
4. Connect concepts to real-world applications
5. Adapt explanations to the user's level

Please maintain a friendly, encouraging tone and use markdown formatting for better readability. Focus on building understanding rather than just providing answers.`;

export async function POST(req: NextRequest) {
  try {
    const { message, history, image } = await req.json();

    // Create model instance
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
    });

    // Start chat with system prompt
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "I understand my role as MathSketch AI. How can I help you today?" }],
        },
        ...(history || []),
      ],
    });

    // If there's an image, use vision model to analyze it
    let context = "";
    if (image) {
      try {
        const visionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
        const imageResult = await visionModel.generateContent([
          "Analyze this mathematical content and provide a brief description:",
          {
            inlineData: {
              data: image.split(",")[1], // Remove data URL prefix
              mimeType: "image/png",
            },
          },
        ]);
        const imageResponse = await imageResult.response;
        context = `Context from image: ${imageResponse.text()}\n\n`;
      } catch (error) {
        console.error("Image analysis error:", error);
      }
    }

    // Send message with context
    const result = await chat.sendMessage(context + message);
    const response = await result.response;
    const text = response.text();

    // Format response with markdown
    const formattedText = text
      .replace(/\*\*/g, "**") // Bold
      .replace(/\n/g, "\n\n") // Double line breaks for better readability
      .replace(/`([^`]+)`/g, "```math\n$1\n```"); // Math blocks

    // Update history with new interaction
    const updatedHistory = [
      ...(history || []),
      { role: "user", parts: [{ text: message }] },
      { role: "model", parts: [{ text: formattedText }] },
    ];

    return NextResponse.json({
      status: "success",
      message: formattedText,
      history: updatedHistory,
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to process chat request. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "success",
    message: "MathSketch Chat API is running",
  });
} 