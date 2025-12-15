import React from 'react';
import { JournalEntry } from '../types';
import { Calendar, Tag, Sparkles, RefreshCw, Quote } from 'lucide-react';

interface HistoryListProps {
  entries: JournalEntry[];
}

const HistoryList: React.FC<HistoryListProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-stone-500">
        <Sparkles className="w-12 h-12 mb-4 text-primary-300 opacity-50" />
        <p className="text-lg font-serif italic">Your journey begins with the first step.</p>
        <p className="text-sm mt-2">Start by adding your first entry today.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {entries.map((entry) => {
        const isReframe = entry.type === 'reframe';
        
        return (
          <div 
            key={entry.id} 
            className={`
              rounded-2xl p-6 shadow-sm border transition-shadow duration-300 hover:shadow-md
              ${isReframe ? 'bg-gradient-to-br from-white to-stone-50 border-stone-200' : 'bg-white border-stone-100'}
            `}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center text-stone-500 text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(entry.timestamp).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="flex gap-2">
                 {isReframe && (
                     <span className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-stone-800 text-white flex items-center">
                        <RefreshCw className="w-3 h-3 mr-1" /> Reframe
                     </span>
                 )}
                 {entry.sentiment && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider
                    ${entry.sentiment === 'joyful' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${entry.sentiment === 'grateful' ? 'bg-primary-100 text-primary-800' : ''}
                    ${entry.sentiment === 'peaceful' ? 'bg-blue-100 text-blue-800' : ''}
                    ${entry.sentiment === 'resilient' ? 'bg-orange-100 text-orange-800' : ''}
                    ${entry.sentiment === 'hopeful' ? 'bg-purple-100 text-purple-800' : ''}
                    ${entry.sentiment === 'neutral' ? 'bg-stone-200 text-stone-700' : ''}
                  `}>
                    {entry.sentiment}
                  </span>
                )}
              </div>
            </div>

            {/* Content Body */}
            {isReframe ? (
                // Reframe Layout
                <div className="space-y-4 mb-4">
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                        <p className="text-xs text-red-600 uppercase tracking-wider font-semibold mb-1">The Challenge</p>
                        <p className="text-stone-700 font-serif italic">{entry.challenge}</p>
                    </div>
                     <div className="flex justify-center -my-6 relative z-10">
                        <div className="bg-white p-1 rounded-full border border-stone-200 shadow-sm">
                            <RefreshCw className="w-4 h-4 text-stone-400" />
                        </div>
                     </div>
                     <div className="bg-green-50 p-4 rounded-xl border border-green-100 pt-6">
                        <p className="text-xs text-green-600 uppercase tracking-wider font-semibold mb-1">New Perspective</p>
                        <p className="text-stone-800 font-serif text-lg">{entry.reframe}</p>
                    </div>
                </div>
            ) : (
                // Gratitude Layout
                <ul className="space-y-3 mb-6">
                  {entry.items?.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center text-xs mr-3 mt-0.5 font-medium">
                        {idx + 1}
                      </span>
                      <span className="text-stone-800 leading-relaxed font-serif text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
            )}

            {/* AI Insight (Common) */}
            {entry.aiInsight && (
              <div className="bg-stone-50 rounded-xl p-4 border-l-4 border-primary-400 relative mt-4">
                <Sparkles className="absolute top-4 right-4 w-4 h-4 text-primary-400 opacity-50" />
                <p className="text-stone-600 text-sm italic leading-relaxed">
                  "{entry.aiInsight}"
                </p>
              </div>
            )}

            {/* Tags */}
            {entry.tags && entry.tags.length > 0 && (
               <div className="mt-4 flex flex-wrap gap-2">
                 {entry.tags.map(tag => (
                   <span key={tag} className="inline-flex items-center text-xs text-stone-400">
                     <Tag className="w-3 h-3 mr-1" /> {tag}
                   </span>
                 ))}
               </div>
            )}
          </div>
        )
      })}
    </div>
  );
};

export default HistoryList;
