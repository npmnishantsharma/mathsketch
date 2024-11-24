"use client"
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { X, ExternalLink } from "lucide-react"
import Image from 'next/image'
import Link from 'next/link'

interface ChangelogEntry {
  version: string;
  date: string;
  title?: string;
  description?: string;
  coverImage?: string;
  changes: {
    type: 'new' | 'improved' | 'fixed';
    description: string;
    image?: string;
    link?: string;
  }[];
}

export const changelog: ChangelogEntry[] = [
  {
    version: "0.43 - Agent",
    date: "Nov 24, 2024",
    title: "Introducing AI Agent Mode",
    description: "A major update bringing autonomous capabilities to our AI assistant.",
    coverImage: "/changelog/0.43-cover.png",
    changes: [
      {
        type: "new",
        description: "Cursor can now pick its own context, use the terminal, and complete entire tasks. To try it out, select \"agent\" in composer.",
        image: "/changelog/agent-demo.gif",
        link: "https://docs.example.com/agent-mode"
      },
      {
        type: "new", 
        description: "A sneak peak at an upcoming bug finder feature",
        image: "/changelog/bug-finder-preview.png"
      },
      {
        type: "improved",
        description: "A simpler, cleaner composer UI with inline diffs!",
        image: "/changelog/new-ui.png"
      },
      {
        type: "new",
        description: "File pill recommendations in chat/composer"
      },
      {
        type: "new",
        description: "The ability to semantically search for context in chat/composer"
      },
      {
        type: "improved",
        description: "A nicer image-dropping experience"
      },
      {
        type: "improved",
        description: "Several performance improvements"
      }
    ]
  },
  // Add more versions here...
];

interface ChangelogProps {
  onClose?: () => void;
  isModal?: boolean;
}

export default function Changelog({ onClose, isModal = true }: ChangelogProps) {
  const Content = () => (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-12">
        {changelog.map((entry) => (
          <div key={entry.version} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-white">{entry.version}</h3>
                  {entry.title && (
                    <p className="text-lg text-zinc-400">{entry.title}</p>
                  )}
                </div>
                <span className="text-sm text-zinc-500 font-medium">{entry.date}</span>
              </div>
              
              {entry.description && (
                <p className="text-zinc-300 text-lg">{entry.description}</p>
              )}

              {entry.coverImage && (
                <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden">
                  <Image
                    src={entry.coverImage}
                    alt={`${entry.version} cover`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              {entry.changes.map((change, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span 
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        change.type === 'new' 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : change.type === 'improved'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {change.type.toUpperCase()}
                    </span>
                    <div className="space-y-2 flex-1">
                      <p className="text-zinc-300">{change.description}</p>
                      
                      {change.link && (
                        <Link 
                          href={change.link}
                          className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                          target="_blank"
                        >
                          Learn more <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {change.image && (
                    <div className="relative w-full h-64 rounded-lg overflow-hidden bg-zinc-800/50">
                      <Image
                        src={change.image}
                        alt={change.description}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );

  if (!isModal) {
    return (
      <div className="bg-zinc-900 rounded-lg shadow-xl max-w-4xl w-full min-h-[50vh] max-h-[90vh] flex flex-col mx-auto my-8">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Changelog</h2>
            <p className="text-sm text-zinc-400">Latest updates and improvements</p>
          </div>
        </div>
        <Content />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Changelog</h2>
            <p className="text-sm text-zinc-400">Latest updates and improvements</p>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Content />
      </div>
    </div>
  );
} 