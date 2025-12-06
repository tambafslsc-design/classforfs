import React from 'react';
import { AnswerHistory, Category } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ResultsProps {
  history: AnswerHistory[];
  onRestart: () => void;
  totalTime: number;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const Results: React.FC<ResultsProps> = ({ history, onRestart, totalTime }) => {
  const correctCount = history.filter(h => h.isCorrect).length;
  const accuracy = Math.round((correctCount / history.length) * 100) || 0;

  // Aggregate data for chart
  const dataMap = new Map<string, { name: string; value: number; color: string }>();
  
  history.forEach(h => {
    const key = h.isCorrect ? 'Correct' : 'Incorrect';
    const existing = dataMap.get(key) || { name: key, value: 0, color: h.isCorrect ? '#10b981' : '#ef4444' };
    existing.value += 1;
    dataMap.set(key, existing);
  });

  const chartData = Array.from(dataMap.values());

  // Sort history: Incorrect answers first
  const sortedHistory = [...history].sort((a, b) => {
    if (a.isCorrect === b.isCorrect) return 0;
    return a.isCorrect ? 1 : -1; // Correct (true) > Incorrect (false), so ascending sort puts false first
  });

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-slate-100 animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-800 text-center mb-2">Quiz Complete!</h2>
      <p className="text-center text-slate-500 mb-8">Here is how you performed</p>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
        <div className="w-full h-64 md:w-1/2">
           <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="text-center md:text-left space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
             <div className="text-sm text-slate-500 uppercase tracking-wide">Final Score</div>
             <div className="text-4xl font-black text-indigo-600">{correctCount} <span className="text-xl text-slate-400">/ {history.length}</span></div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
             <div className="text-sm text-slate-500 uppercase tracking-wide">Accuracy</div>
             <div className={`text-4xl font-black ${accuracy >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>{accuracy}%</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
             <div className="text-sm text-slate-500 uppercase tracking-wide">Time Taken</div>
             <div className="text-4xl font-black text-slate-700">{formatTime(totalTime)}</div>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto pr-2 mb-6 custom-scrollbar">
        {sortedHistory.map((h, idx) => (
          <div key={idx} className={`flex justify-between items-center p-3 rounded border-l-4 ${h.isCorrect ? 'bg-emerald-50 border-emerald-400' : 'bg-rose-50 border-rose-400'}`}>
             <div>
                <div className="font-semibold text-slate-700">{h.account.name}</div>
                {!h.isCorrect && <div className="text-xs text-rose-600">Correct: {h.account.category}</div>}
             </div>
             <div className={`font-bold ${h.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                {h.isCorrect ? '✓' : '✗'}
             </div>
          </div>
        ))}
      </div>

      <button 
        onClick={onRestart}
        className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
      >
        Start New Quiz
      </button>
    </div>
  );
};

export default Results;