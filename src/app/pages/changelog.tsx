"use client"
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    type: 'new' | 'improved' | 'fixed';
    description: string;
  }[];
}

const changelog: ChangelogEntry[] = [
  {
    version: "0.43 - Agent",
    date: "Nov 24, 2024",
    changes: [
      {
        type: "new",
        description: "Cursor can now pick its own context, use the terminal, and complete entire tasks. To try it out, select \"agent\" in composer."
      },
      {
        type: "new", 
        description: "A sneak peak at an upcoming bug finder feature"
      },
      {
        type: "improved",
        description: "A simpler, cleaner composer UI with inline diffs!"
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
}

export default function Changelog({ onClose }: ChangelogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white">Changelog</h2>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-8">
            {changelog.map((entry) => (
              <div key={entry.version} className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-semibold text-white">{entry.version}</h3>
                  <span className="text-sm text-zinc-400">{entry.date}</span>
                </div>
                
                <div className="space-y-2">
                  {entry.changes.map((change, index) => (
                    <div key={index} className="flex items-start gap-2">
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
                      <p className="text-zinc-300 flex-1">{change.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
} 