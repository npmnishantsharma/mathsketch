'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 via-red-600 to-red-700">
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-8 text-white">
        <h2 className="text-lg font-bold mb-4">Something went wrong!</h2>
        <p className="mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  );
} 