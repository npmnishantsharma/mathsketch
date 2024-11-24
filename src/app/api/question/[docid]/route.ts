import { db } from "@/lib/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { docid: string } }
) {
  try {
    const docId = params.docid;
    
    // Get the document from Firestore
    const docRef = doc(db, "quizzes", docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Get the document data
    const questionData = docSnap.data();

    // Return only necessary fields for the quiz question
    const response = {
      question: questionData.question,
      options: questionData.options,
      explanation: questionData.explanation,
      isQuiz: questionData.isQuiz,
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "Failed to fetch question", message: error },
      { status: 500 }
    );
  }
} 