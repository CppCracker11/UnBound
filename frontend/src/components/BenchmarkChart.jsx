import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function BenchmarkChart({ data }) {
    if (!data || data.length === 0) return (
        <div className="h-full flex items-center justify-center text-gray-600">
            Run an experiment to see performance curves.
        </div>
    );

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="n" stroke="#888" label={{ value: 'Nodes (N)', position: 'insideBottomRight', offset: -10 }} />
                    <YAxis stroke="#888" label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="exact.time" name="Exact (DP)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="greedy.time" name="Greedy" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="chris.time" name="Christofides" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}