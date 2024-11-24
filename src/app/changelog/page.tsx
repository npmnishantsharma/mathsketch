import { Metadata } from 'next';
import { FaGithub } from 'react-icons/fa';
import { BsWindows } from 'react-icons/bs';
import { getChangelogs, type ChangelogEntry } from '@/lib/services/changelog';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Changelog | MathSketch',
  description: 'Latest updates and improvements to MathSketch',
};

export default async function ChangelogPage() {
  const changelogs = await getChangelogs();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="container mx-auto px-4">
        <div className="flex relative">
          {/* Hero Section - Left Side Fixed */}
          <div className="w-1/3 fixed left-0 top-0 h-screen flex items-center pl-8">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold mb-4">MathSketch</h1>
              <p className="text-2xl text-zinc-400 mb-8">
                A collaborative whiteboard designed for{' '}
                <span className="text-blue-400">mathematical expressions</span>
              </p>
              
              <div className="flex gap-4">
                <a 
                  href="https://github.com/yourusername/mathsketch" 
                  className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 px-4 py-2 rounded-lg transition-colors"
                >
                  <FaGithub className="text-xl" /> GitHub
                </a>
                <a 
                  href="/download" 
                  className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 px-4 py-2 rounded-lg transition-colors"
                >
                  <BsWindows className="text-xl" /> Download
                </a>
              </div>
            </div>
          </div>

          {/* Changelog Section - Right Side */}
          <div className="w-2/3 py-12 pl-12 ml-[33.333333%]">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-zinc-800" />

              {changelogs.map((entry) => (
                <div key={entry.id} className="mb-16 relative pl-12">
                  {/* Timeline Dot */}
                  <div className="absolute left-[-5px] top-3 w-[10px] h-[10px] rounded-full bg-blue-400 ring-4 ring-zinc-950" />
                  
                  {/* Date Label */}
                  <div className="absolute left-[-120px] top-1 text-sm text-zinc-500">
                    {entry.date}
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-xl">{entry.version}</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${entry.tagColor}`}>
                      {entry.tag}
                    </span>
                  </div>

                  <p className="text-lg mb-6 text-zinc-300">
                    {entry.description}
                  </p>

                  <ul className="space-y-3">
                    {entry.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-zinc-300">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        {feature.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 