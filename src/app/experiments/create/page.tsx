'use client';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateExperimentPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const coll = collection(db, 'experiments');
      await addDoc(coll, { name, description });
      router.push('/experiments'); // Redirect to the experiments list after creation
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-8 shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Create New Experiment</h2>
        
        <div className="mb-4">
          <label className="block text-gray-300 mb-2" htmlFor="name">Experiment Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 mb-2" htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            rows={4}
            required
          />
        </div>

        <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded">
          Create Experiment
        </button>
      </form>
    </div>
  );
} 