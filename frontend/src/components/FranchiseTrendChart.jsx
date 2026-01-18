import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const FranchiseTrendChart = ({ prediction1, prediction2 }) => {
    // Merged Data for Single Chart Comparison
    // We use a linear timeline from 2012 to 2027
    const data = [
        { year: '2012', Avengers: 207.4, Dune: null, name: 'Avengers' },
        { year: '2015', Avengers: 191.3, Dune: null, name: 'Age of Ultron' },
        { year: '2018', Avengers: 257.7, Dune: null, name: 'Infinity War' },
        { year: '2019', Avengers: 357.1, Dune: null, name: 'Endgame' },
        { year: '2021', Avengers: null, Dune: 41.0, name: 'Dune 1' },
        { year: '2024', Avengers: null, Dune: 82.5, name: 'Dune 2' },
        {
            year: '2026',
            Avengers: prediction1 ? prediction1.opening_weekend / 1000000 : null,
            Dune: prediction2 ? prediction2.opening_weekend / 1000000 : null,
            name: '2026 Release',
            isPrediction: true
        },
    ].sort((a, b) => parseInt(a.year) - parseInt(b.year)); // Sort chronologically

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 border border-gray-700 p-3 rounded shadow-xl max-w-xs">
                    <p className="font-bold text-white mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        entry.value ? (
                            <p key={index} style={{ color: entry.color }} className="text-sm mb-1">
                                {entry.name}: <span className="font-mono font-bold">${entry.value.toFixed(1)}M</span>
                                {entry.payload.isPrediction && " (Pred)"}
                            </p>
                        ) : null
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="glass-panel p-6 mt-6">
            <h3 className="text-xl font-bold mb-4 text-white">Franchise Trajectory Comparison</h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis dataKey="year" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" tickFormatter={(val) => `$${val}M`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="top" height={36} />

                        {/* Avengers Line (Red Dashed) */}
                        <Line
                            type="monotone"
                            dataKey="Avengers"
                            stroke="#ef4444"
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            name="Avengers Franchise"
                            connectNulls={true}
                            dot={{ r: 6, fill: '#ef4444' }}
                            activeDot={{ r: 8 }}
                        />

                        {/* Dune Line (Grey/Blue Solid) */}
                        <Line
                            type="monotone"
                            dataKey="Dune"
                            stroke="#9ca3af"
                            strokeWidth={3}
                            name="Dune Franchise"
                            connectNulls={true}
                            dot={{ r: 6, fill: '#9ca3af' }}
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
                Dashed Red: Avengers History & Prediction | Solid Grey: Dune History & Prediction
            </p>
        </div>
    );
};

export default FranchiseTrendChart;
