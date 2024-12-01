'use client';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Fetch experiments from the database
async function getExperiments() {
  const coll = collection(db, 'experiments');
  const snapshot = await getDocs(coll);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), isEnabled: true }));
}

// Experiment card component
const ExperimentCard = ({ experiment, toggleEnabled }: { experiment: any; toggleEnabled: (id: string, isEnabled: boolean) => void }) => (
  <motion.div
    className={`relative bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 
               shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_25px_rgba(0,0,0,0.3)]
               border border-gray-800/50 backdrop-blur-sm ${experiment.isEnabled ? '' : 'opacity-50'}`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <div className="relative z-10">
      <h3 className="text-lg font-medium bg-gradient-to-r from-gray-200 to-gray-400 
                   bg-clip-text text-transparent mb-3 capitalize tracking-wide">
        {experiment.name}
      </h3>
      <p className="text-sm text-gray-400">{experiment.description}</p>
      <label className="inline-flex items-center mt-4">
        <input 
          type="checkbox" 
          checked={experiment.isEnabled} 
          onChange={() => toggleEnabled(experiment.id, !experiment.isEnabled)} 
          className="form-checkbox h-5 w-5 text-purple-600"
        />
        <span className="ml-2 text-white">Enable Experiment</span>
      </label>
    </div>
  </motion.div>
);

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [isCreationEnabled, setIsCreationEnabled] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getExperiments().then(setExperiments);
  }, []);

  const toggleEnabled = async (id: string, isEnabled: boolean) => {
    // Update the local state
    setExperiments((prev) =>
      prev.map((experiment) =>
        experiment.id === id ? { ...experiment, isEnabled } : experiment
      )
    );

    // Update the Firestore document
    const experimentRef = doc(db, 'experiments', id);
    await updateDoc(experimentRef, { isEnabled });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="p-6">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8"
        >
          Available Experiments
        </motion.h2>

        {/* Toggle Button for Creation */}
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input 
              type="checkbox" 
              checked={isCreationEnabled} 
              onChange={() => setIsCreationEnabled(!isCreationEnabled)} 
              className="form-checkbox h-5 w-5 text-purple-600"
            />
            <span className="ml-2 text-white">Enable Experiment Creation</span>
          </label>
        </div>

        {/* Create New Experiment Button */}
        {isCreationEnabled && (
          <button 
            className="bg-purple-600 hover:bg-purple-500 text-white py-2 px-4 rounded mb-6"
            onClick={() => router.push('/experiments/create')}
          >
            Create New Experiment
          </button>
        )}

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {experiments.length > 0 ? (
            experiments.map((experiment) => (
              <ExperimentCard key={experiment.id} experiment={experiment} toggleEnabled={toggleEnabled} />
            ))
          ) : (
            <div className="col-span-full text-center text-white">
              <p className="text-lg"> No experiments available</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
