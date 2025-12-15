import React, { useMemo } from 'react';
import { JournalEntry, UserStats } from '../types';
import { TrendingUp, Award, CalendarDays, Sun } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface StatsViewProps {
  entries: JournalEntry[];
  stats: UserStats;
}

const COLORS = ['#fde047', '#5eead4', '#93c5fd', '#fdba74', '#d8b4fe'];

const StatsView: React.FC<StatsViewProps> = ({ entries, stats }) => {
  
  const emotionData = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach(e => {
      if (e.sentiment) {
        counts[e.sentiment] = (counts[e.sentiment] || 0) + 1;
      }
    });
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [entries]);

  // Calculate current streak visually
  const streakArray = useMemo(() => {
    const arr = [];
    for(let i=0; i<5; i++) {
        arr.push(i < stats.currentStreak);
    }
    return arr;
  }, [stats.currentStreak]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mb-2">
            <Award className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-stone-800">{stats.totalEntries}</span>
          <span className="text-xs text-stone-500 uppercase tracking-wide">Total Entries</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center justify-center text-center">
           <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-stone-800">{stats.currentStreak}</span>
          <span className="text-xs text-stone-500 uppercase tracking-wide">Day Streak</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center justify-center text-center col-span-2 md:col-span-2">
           <div className="flex space-x-2 mb-2">
             {streakArray.map((active, i) => (
                <div key={i} className={`w-3 h-8 rounded-full ${active ? 'bg-primary-400' : 'bg-stone-200'}`}></div>
             ))}
           </div>
           <span className="text-sm text-stone-600">Keep the momentum going!</span>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emotion Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 min-h-[300px] flex flex-col">
          <h3 className="text-lg font-serif font-semibold text-stone-800 mb-4 flex items-center">
            <Sun className="w-5 h-5 mr-2 text-yellow-500" />
            Emotional Landscape
          </h3>
          {emotionData.length > 0 ? (
            <div className="flex-1 w-full h-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={emotionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {emotionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#57534e' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {emotionData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center text-xs text-stone-500">
                          <span className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                          <span className="capitalize">{entry.name}</span>
                      </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-stone-400 text-sm italic">
              Not enough data yet.
            </div>
          )}
        </div>

        {/* Recent Motivation */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-8 rounded-2xl shadow-lg text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-yellow-300 opacity-20 rounded-full blur-xl"></div>
          
          <CalendarDays className="w-8 h-8 mb-4 opacity-80" />
          <h3 className="text-2xl font-serif mb-2">Consistency is Key</h3>
          <p className="text-primary-100 leading-relaxed mb-6">
            "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
          </p>
          <div className="mt-auto pt-4 border-t border-white/20">
             <p className="text-sm font-medium opacity-90">
               {stats.lastEntryDate === new Date().toISOString().split('T')[0] 
                 ? "You've completed your journal today!" 
                 : "You haven't journaled yet today."}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsView;
