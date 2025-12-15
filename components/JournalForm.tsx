import React, { useState } from 'react';
import { analyzeJournalEntry } from '../services/gemini';
import { Loader2, Send, CheckCircle2 } from 'lucide-react';
import { JournalEntry } from '../types';

interface JournalFormProps {
  onSave: (entry: JournalEntry) => void;
}

const JournalForm: React.FC<JournalFormProps> = ({ onSave }) => {
  const [items, setItems] = useState<[string, string, string]>(['', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (index: number, value: string) => {
    const newItems = [...items] as [string, string, string];
    newItems[index] = value;
    setItems(newItems);
  };

  const isFormValid = items.every(item => item.trim().length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // 1. Get AI Analysis
      const analysis = await analyzeJournalEntry(items);

      // 2. Create Entry
      const newEntry: JournalEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        dateStr: new Date().toISOString().split('T')[0],
        items: items,
        aiInsight: analysis.insight,
        sentiment: analysis.sentiment,
        tags: analysis.tags
      };

      // 3. Complete
      onSave(newEntry);
      setShowSuccess(true);
      
      // Reset after showing success briefly
      setTimeout(() => {
        setItems(['', '', '']);
        setShowSuccess(false);
        setIsSubmitting(false);
      }, 2000);

    } catch (error) {
      console.error("Submission failed", error);
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-96 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
          <CheckCircle2 size={48} />
        </div>
        <h3 className="text-2xl font-serif text-stone-800 mb-2">Wonderful!</h3>
        <p className="text-stone-500">Your positivity has been recorded.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-serif text-stone-800 mb-3">Three Good Things</h2>
        <p className="text-stone-500 leading-relaxed">
          Reflect on your day and write down three things that went well or that you are grateful for. 
          Focus on the feelings associated with them.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {[0, 1, 2].map((index) => (
          <div key={index} className="group relative">
             <div className="absolute -left-10 top-3 w-8 h-8 rounded-full border border-stone-200 text-stone-400 flex items-center justify-center font-serif italic text-sm group-focus-within:border-primary-400 group-focus-within:text-primary-600 transition-colors hidden sm:flex">
               {index + 1}
             </div>
             <div className="relative">
                <textarea
                  value={items[index]}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder={`Good thing #${index + 1}...`}
                  className="w-full p-4 pl-4 sm:pl-4 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none transition-all resize-none shadow-sm text-lg font-serif text-stone-800 placeholder:text-stone-300 placeholder:font-sans min-h-[100px]"
                  maxLength={300}
                />
             </div>
          </div>
        ))}

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`
              flex items-center justify-center px-8 py-3 rounded-full font-medium text-lg transition-all duration-300
              ${!isFormValid || isSubmitting 
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                : 'bg-primary-600 text-white shadow-lg shadow-primary-200 hover:bg-primary-700 hover:shadow-primary-300 hover:-translate-y-0.5'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                Reflecting...
              </>
            ) : (
              <>
                Save Entry
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JournalForm;
