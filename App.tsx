import React, { useState, useEffect } from 'react';
import { JournalEntry, UserStats, AppView } from './types';
import JournalForm from './components/JournalForm';
import ReframeForm from './components/ReframeForm';
import HistoryList from './components/HistoryList';
import StatsView from './components/StatsView';
import { Book, BarChart2, PenTool, Leaf, RefreshCw } from 'lucide-react';
import { generateWeeklyWisdom } from './services/gemini';

const STORAGE_KEY = 'positivity_journal_entries';

const App: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentView, setCurrentView] = useState<AppView>(AppView.WRITE);
  const [dailyQuote, setDailyQuote] = useState<string>("");

  // Load data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse journal entries", e);
      }
    }
    
    // Load quote
    const fetchQuote = async () => {
        const quote = await generateWeeklyWisdom();
        setDailyQuote(quote);
    }
    fetchQuote();

  }, []);

  // Save data on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const handleSaveEntry = (newEntry: JournalEntry) => {
    setEntries(prev => [newEntry, ...prev]);
    setCurrentView(AppView.HISTORY);
  };

  const getStats = (): UserStats => {
    // Simple streak calculation logic
    let streak = 0;
    if (entries.length > 0) {
      // Sort entries by date desc
      const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);
      const uniqueDates = Array.from(new Set(sorted.map(e => e.dateStr)));
      
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      let lastDate = uniqueDates[0];

      // If last entry was today or yesterday, streak is active
      if (lastDate === today || lastDate === yesterday) {
          streak = 1;
          let currentDate = new Date(lastDate);
          
          for (let i = 1; i < uniqueDates.length; i++) {
              const prevDate = new Date(currentDate);
              prevDate.setDate(prevDate.getDate() - 1);
              const expectedStr = prevDate.toISOString().split('T')[0];
              
              if (uniqueDates[i] === expectedStr) {
                  streak++;
                  currentDate = prevDate;
              } else {
                  break;
              }
          }
      }
    }

    return {
      totalEntries: entries.length,
      currentStreak: streak,
      lastEntryDate: entries.length > 0 ? entries[0].dateStr : null
    };
  };

  return (
    <div className="min-h-screen font-sans text-stone-800 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-stone-200 md:min-h-screen flex flex-col sticky top-0 z-10 md:relative">
        <div className="p-6 border-b border-stone-100 flex items-center justify-center md:justify-start">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white mr-3 shadow-lg shadow-primary-200">
            <Leaf size={20} />
          </div>
          <h1 className="font-serif text-xl font-bold tracking-tight text-stone-800">Positivity<br/><span className="text-primary-600">Journal</span></h1>
        </div>

        <nav className="flex-1 p-4 flex flex-row md:flex-col justify-around md:justify-start gap-2 overflow-x-auto">
          <button
            onClick={() => setCurrentView(AppView.WRITE)}
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === AppView.WRITE 
                ? 'bg-primary-50 text-primary-700 font-medium' 
                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
            }`}
          >
            <PenTool size={20} className="mr-3" />
            <span className="hidden md:inline">Today's Entry</span>
            <span className="md:hidden">Write</span>
          </button>

          <button
            onClick={() => setCurrentView(AppView.REFRAME)}
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === AppView.REFRAME 
                ? 'bg-primary-50 text-primary-700 font-medium' 
                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
            }`}
          >
            <RefreshCw size={20} className="mr-3" />
            <span className="hidden md:inline">Shift Perspective</span>
            <span className="md:hidden">Reframe</span>
          </button>

          <button
            onClick={() => setCurrentView(AppView.HISTORY)}
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === AppView.HISTORY 
                ? 'bg-primary-50 text-primary-700 font-medium' 
                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
            }`}
          >
            <Book size={20} className="mr-3" />
            <span className="hidden md:inline">History</span>
            <span className="md:hidden">History</span>
          </button>

          <button
            onClick={() => setCurrentView(AppView.INSIGHTS)}
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === AppView.INSIGHTS 
                ? 'bg-primary-50 text-primary-700 font-medium' 
                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
            }`}
          >
            <BarChart2 size={20} className="mr-3" />
            <span className="hidden md:inline">Insights</span>
            <span className="md:hidden">Stats</span>
          </button>
        </nav>

        <div className="p-6 mt-auto hidden md:block">
           <div className="bg-stone-900 rounded-2xl p-4 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
              <p className="text-xs text-stone-400 uppercase tracking-widest mb-2 font-medium">Daily Wisdom</p>
              <p className="font-serif italic text-sm leading-relaxed opacity-90">
                "{dailyQuote}"
              </p>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-paper/50 relative overflow-y-auto h-[calc(100vh-80px)] md:h-screen">
        <header className="px-8 py-8 md:pt-12 pb-6 max-w-4xl mx-auto">
          {currentView === AppView.WRITE && (
            <div className="mb-2">
              <span className="text-primary-600 font-medium text-sm tracking-wider uppercase">Good Morning</span>
              <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mt-1">
                What are you grateful for?
              </h2>
            </div>
          )}
          {currentView === AppView.REFRAME && (
            <div className="mb-2">
              <span className="text-stone-500 font-medium text-sm tracking-wider uppercase">Positive Psychology Tool</span>
              <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mt-1">
                Challenge into Opportunity
              </h2>
            </div>
          )}
           {currentView === AppView.HISTORY && (
            <div className="mb-2">
               <span className="text-primary-600 font-medium text-sm tracking-wider uppercase">Your Journey</span>
               <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mt-1">
                Journal History
              </h2>
            </div>
          )}
           {currentView === AppView.INSIGHTS && (
            <div className="mb-2">
               <span className="text-primary-600 font-medium text-sm tracking-wider uppercase">Overview</span>
               <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mt-1">
                Your Progress
              </h2>
            </div>
          )}
        </header>

        <div className="px-4 md:px-8 pb-12 max-w-4xl mx-auto">
          {currentView === AppView.WRITE && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <JournalForm onSave={handleSaveEntry} />
            </div>
          )}
          
          {currentView === AppView.REFRAME && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <ReframeForm onSave={handleSaveEntry} />
            </div>
          )}

          {currentView === AppView.HISTORY && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
               <HistoryList entries={entries} />
            </div>
          )}

          {currentView === AppView.INSIGHTS && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
               <StatsView entries={entries} stats={getStats()} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
