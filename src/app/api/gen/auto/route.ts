import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { headers } from 'next/headers';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

/**
 * Analyze a math equation image using Google's Gemini model and return the solution.
 * @param imageData Base64 encoded image data
 * @returns The calculated answer
 */
async function solveMathEquation(imageData: string): Promise<string> {
  try {
    // Create model instance
    const model = genAI.getGenerativeModel({
      model: "learnlm-1.5-pro-experimental",
      generationConfig: {
        temperature: 0.1, // Low temperature for more precise answers
        topK: 1,
        topP: 1,
        maxOutputTokens: 256, // Short responses only
      }
    });

    // Prepare the prompt
    const prompt = `
      Give the answer to this math equation. 
      Only respond with the answer. 
      Only respond with numbers. NEVER Words. 
      Only answer unanswered expressions. 
      Look for equal sign with nothing on the right of it. 
      If it has an answer already, DO NOT ANSWER it.
    `;

    // Remove data URL prefix if present
    const imageBytes = imageData.replace(/^data:image\/\w+;base64,/, "");

    // Generate response
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBytes,
          mimeType: "image/png"
        }
      }
    ]);

    const response = await result.response;
    return response.text().trim();

  } catch (error) {
    console.error("Error solving math equation:", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error solving equation");
  }
}

export const runtime = 'edge';
export const revalidate = 3600; // Cache for 1 hour

export async function POST(req: NextRequest) {
  try {
    const headersList = headers();
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Generate cache key based on inpu

    const answer = await solveMathEquation(image);

    // Return the result
    const response = NextResponse.json({
      status: "success",
      data: [{
        expr: "Auto-detected equation",
        result: answer,
        explanation: "Automatically solved using AI",
        basic_concepts: "This is an automatic solution for quick calculations.",
        practice_questions: ["Try solving similar equations step by step."],
        quiz_questions: []
      }]
    });

    // Cache the response
    cache.put(cacheKey, response.clone());
    
    return response;

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to solve equation",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "success",
    message: "Math Auto-Solve API is running"
  });
}
