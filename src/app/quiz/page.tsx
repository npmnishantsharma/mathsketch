"use client"
import React from 'react';
import Link from 'next/link';

export default function QuizPage() {
  return (
    <main className="p-4">
      <nav className="mb-4">
        <Link href="/" className="text-blue-500 hover:text-blue-700">
          Back to Canvas
        </Link>
      </nav>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Math Quiz</h1>
        <p>Quiz content will go here...</p>
      </div>
    </main>
  );
} 