
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface HistoryItem {
  name: string;
  won: boolean;
  score: number;
}

const GameStats: React.FC<{ history: HistoryItem[] }> = ({ history }) => {
  if (history.length === 0) return null;

  const data = history.slice(-5).map((item, idx) => ({
    name: item.name.split(' ')[0], // Short name
    score: item.score,
    won: item.won,
  }));

  return (
    <div className="mt-8 bg-white p-6 rounded-3xl shadow-xl border-4 border-yellow-400">
      <h3 className="font-impact text-2xl text-blue-600 mb-4 text-center">Últimas Partidas</h3>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="score">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.won ? '#22c55e' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GameStats;
