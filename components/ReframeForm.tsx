import React, { useState } from 'react';
import { getReframingSuggestions, ReframeSuggestion } from '../services/gemini';
import { Loader2, Sparkles, ArrowRight, RefreshCw, CheckCircle2, Search, Zap, Sun } from 'lucide-react';
import { JournalEntry } from '../types';

interface ReframeFormProps {
  onSave: (entry: JournalEntry) => void;
}

const ReframeForm: React.FC<ReframeFormProps> = ({ onSave }) => {
  const [challenge, setChallenge] = useState('');
  const [suggestions, setSuggestions] = useState<ReframeSuggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number | null>(null);
  const [selectedReframeText, setSelectedReframeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Input, 2: Selection, 3: Edit/Save

  const handleGetSuggestions = async () => {
    if (!challenge.trim()) return;
    setIsLoading(true);
    const results = await getReframingSuggestions(challenge);
    setSuggestions(results);
    setStep(2);
    setIsLoading(false);
  };

  const handleSelectSuggestion = (index: number) => {
    setSelectedSuggestionIndex(index);
    setSelectedReframeText(suggestions[index].explanation);
    setStep(3);
  };

  const handleSave = () => {
    const selectedPerspectiveLabel = selectedSuggestionIndex !== null 
        ? suggestions[selectedSuggestionIndex].perspective 
        : 'Reframing';

    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      dateStr: new Date().toISOString().split('T')[0],
      type: 'reframe',
      challenge: challenge,
      reframe: selectedReframeText,
      sentiment: 'resilient',
      tags: ['Reframing', selectedPerspectiveLabel]
    };
    onSave(newEntry);
  };

  const getIconForPerspective = (label: string) => {
      const l = label.toLowerCase();
      if (l.includes('curiosity')) return <Search className="w-5 h-5 text-blue-500" />;
      if (l.includes('growth')) return <Zap className="w-5 h-5 text-purple-500" />;
      return <Sun className="w-5 h-5 text-orange-500" />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-serif text-stone-800 mb-3">Shift Your Perspective</h2>
        <p className="text-stone-500 leading-relaxed">
          Train your brain to find the <strong>Lesson (Growth)</strong>, the <strong>Silver Lining (Optimism)</strong>, or turn <strong>Judgment into Wonder (Curiosity)</strong>.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-stone-100 transition-all">
        
        {/* Step 1: The Challenge */}
        <div className={`transition-all duration-500 ${step !== 1 ? 'opacity-50 pointer-events-none' : ''}`}>
           <label className="block text-sm font-medium text-stone-600 mb-2 uppercase tracking-wider">
             The Situation
           </label>
           <textarea
             value={challenge}
             onChange={(e) => setChallenge(e.target.value)}
             disabled={step !== 1}
             placeholder="What is weighing on your mind today? Describe the challenge..."
             className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none transition-all resize-none font-serif text-lg min-h-[120px]"
           />
           {step === 1 && (
             <div className="mt-4 flex justify-end">
               <button
                 onClick={handleGetSuggestions}
                 disabled={!challenge.trim() || isLoading}
                 className="flex items-center px-6 py-3 bg-stone-800 text-white rounded-full hover:bg-stone-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-stone-200"
               >
                 {isLoading ? <Loader2 className="animate-spin mr-2 w-4 h-4"/> : <Sparkles className="mr-2 w-4 h-4 text-yellow-300"/>}
                 Find New Perspectives
               </button>
             </div>
           )}
        </div>

        {/* Step 2: AI Suggestions */}
        {step >= 2 && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-stone-600 uppercase tracking-wider">
                  Choose a Path
                </label>
                {step > 2 && (
                    <button onClick={() => setStep(2)} className="text-xs text-primary-600 hover:underline">Change Selection</button>
                )}
             </div>
             
             <div className="grid gap-4">
               {suggestions.map((s, idx) => (
                 <button
                   key={idx}
                   onClick={() => handleSelectSuggestion(idx)}
                   className={`text-left p-5 rounded-xl border transition-all duration-300 group relative overflow-hidden flex flex-col
                     ${selectedSuggestionIndex === idx && step === 3
                       ? 'bg-primary-50 border-primary-300 ring-1 ring-primary-300' 
                       : 'bg-white border-stone-200 hover:border-primary-200 hover:shadow-md'
                     }
                   `}
                 >
                   <div className="flex items-center mb-2">
                       <div className="p-1.5 rounded-lg bg-stone-100 mr-2">
                           {getIconForPerspective(s.perspective)}
                       </div>
                       <h4 className="font-bold text-stone-800 flex-1">
                         {s.perspective}
                       </h4>
                       <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary-500 transform group-hover:translate-x-1 duration-300" />
                   </div>
                   <p className="text-stone-600 text-sm font-serif leading-relaxed pl-10">{s.explanation}</p>
                 </button>
               ))}
             </div>
          </div>
        )}

        {/* Step 3: Finalize */}
        {step === 3 && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <label className="block text-sm font-medium text-stone-600 mb-2 uppercase tracking-wider">
               Internalize It
             </label>
             <div className="relative">
                <textarea
                    value={selectedReframeText}
                    onChange={(e) => setSelectedReframeText(e.target.value)}
                    className="w-full p-4 bg-primary-50/50 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-200 outline-none font-serif text-lg text-stone-800 min-h-[100px]"
                />
                <div className="absolute top-3 right-3">
                   <RefreshCw className="w-4 h-4 text-primary-400 opacity-50" />
                </div>
             </div>
             
             <div className="mt-6 flex justify-end">
               <button
                 onClick={handleSave}
                 className="flex items-center px-8 py-3 bg-primary-600 text-white rounded-full font-medium shadow-lg shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1 transition-all"
               >
                 Embrace Perspective
                 <CheckCircle2 className="ml-2 w-5 h-5" />
               </button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ReframeForm;
