import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { headers } from 'next/headers';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

// Define interface for answer structure
interface Answer {
  expr?: string;
  result?: string;
  explanation?: string;
  basic_concepts?: string;
  practice_questions?: string[];
  quiz_questions?: QuizQuestion[];
  assign?: boolean;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

// Helper function to clean Gemini response
function cleanGeminiResponse(responseText: string): string {
  const pattern = /```(?:json)?\n?([\s\S]*?)\n?```/;
  const match = pattern.exec(responseText);
  if (match) {
    return match[1].trim();
  }
  return responseText.trim();
}

// Add cache configuration
export const runtime = 'edge';
export const revalidate = 3600; // Cache for 1 hour

export async function POST(req: NextRequest) {
  try {
    const headersList = headers();
    const { image, dict_of_vars } = await req.json();

    // Generate cache key based on input

    // Create model instance with optimized settings
    const model = genAI.getGenerativeModel({
      model: "learnlm-1.5-pro-experimental",
      generationConfig: {
        temperature: 0.3, // Lower temperature for more focused responses
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 1024, // Reduced for faster responses
      }
    });

    // Optimized prompt for faster, more focused responses
    const prompt = `Analyze this mathematical image and provide a concise response:
    1. If it's an expression/equation:
       - Solve it
       - Provide a brief explanation
       - List key concepts

    2. If it's a diagram/concept:
       - Identify the main topic
       - Explain core principles
       - Give practical examples

    Required format:
    {
      "expr": "expression or topic",
      "result": "solution or main concept",
      "explanation": "brief markdown explanation",
      "basic_concepts": "key principles (1-2 sentences)",
      "practice_questions": ["2-3 focused questions"],
      "quiz_questions": [{
        "question": "test understanding",
        "options": ["4 choices"],
        "correctAnswer": "correct option",
        "explanation": "brief explanation"
      }]
    }

    Variables if needed: ${JSON.stringify(dict_of_vars)}`;

    // Generate content with streaming disabled for faster processing
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: image.split(",")[1],
          mimeType: "image/png"
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    try {
      const cleanedResponse = cleanGeminiResponse(text);
      let answers: Answer[] = JSON.parse(cleanedResponse);
      
      if (!Array.isArray(answers)) {
        answers = [answers];
      }

      // Quick validation of essential fields
      const validatedAnswers = answers.map((answer: Answer) => ({
        expr: answer.expr || "Expression",
        result: answer.result || "Result pending",
        explanation: answer.explanation || "Analysis in progress",
        basic_concepts: answer.basic_concepts || "Core concepts loading",
        practice_questions: (answer.practice_questions || []).slice(0, 3), // Limit to 3 questions
        quiz_questions: (answer.quiz_questions || []).slice(0, 5), // Limit to 5 questions initially
        assign: "assign" in answer
      }));

      // Cache the response
      const newResponse = NextResponse.json({
        status: "success",
        message: "Analysis complete",
        data: validatedAnswers
      });
      cache.put(cacheKey, newResponse.clone());
      
      return newResponse;

    } catch (parseError) {
      console.error("Parse error:", parseError);
      return NextResponse.json({
        status: "error",
        message: "Error parsing response",
        data: [{
          expr: "Processing error",
          result: "Retry needed",
          explanation: "Unable to process response",
          basic_concepts: "Error occurred during analysis",
          practice_questions: ["Please try again"],
          quiz_questions: []
        }]
      });
    }

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Request failed",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "success",
    message: "API ready"
  });
}
