import React, { useEffect, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

const ScatterAccuracyChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const dummyHistory = [
            { name: 'Endgame', actual: 357, predicted: 340 }, // ~4% error (Green)
            { name: 'No Way Home', actual: 260, predicted: 250 }, // ~3.8% error (Green)
            { name: 'Infinity War', actual: 257, predicted: 265 }, // ~3% error (Green)
            { name: 'Force Awakens', actual: 247, predicted: 215 }, // ~13% error (Yellow)
            { name: 'Jurassic World', actual: 208, predicted: 235 }, // ~13% error (Yellow)
            { name: 'Black Panther', actual: 202, predicted: 190 }, // ~6% error (Green)
            { name: 'Avatar 2', actual: 134, predicted: 145 }, // ~8% error (Green)
            { name: 'Barbie', actual: 162, predicted: 155 }, // ~4% error (Green)
            { name: 'Oppenheimer', actual: 82, predicted: 70 }, // ~14% error (Yellow)
            { name: 'Dune 2', actual: 82.5, predicted: 85 }, // ~3% error (Green)
        ];
        setData(dummyHistory);
    }, []);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            const error = ((d.predicted - d.actual) / d.actual) * 100;
            return (
                <div className="bg-gray-900 border border-gray-700 p-3 rounded shadow-xl">
                    <p className="font-bold text-white mb-1">{d.name}</p>
                    <p className="text-gray-300">Actual: ${d.actual}M</p>
                    <p className="text-cyan-400">Predicted: ${d.predicted}M</p>
                    <p className={Math.abs(error) > 10 ? "text-yellow-400" : "text-green-400"}>
                        Error: {error > 0 ? "+" : ""}{error.toFixed(1)}%
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="glass-panel p-6 mt-6">
            <h3 className="text-xl font-bold mb-4 text-white text-center">Model Performance: Predicted vs Actual ($M)</h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 50, left: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                            type="number"
                            dataKey="actual"
                            name="Actual"
                            unit="M"
                            stroke="#9ca3af"
                            label={{ value: 'Actual Box Office ($M)', position: 'insideBottom', offset: -10, fill: '#9ca3af' }}
                        />
                        <YAxis
                            type="number"
                            dataKey="predicted"
                            name="Predicted"
                            unit="M"
                            stroke="#9ca3af"
                            label={{ value: 'Predicted ($M)', angle: 0, position: 'top', offset: 20, fill: '#9ca3af', dy: -20, dx: 0 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                        <Legend verticalAlign="top" height={36} />

                        <Scatter name="Validation Movies" data={data} fill="#8884d8">
                            {data.map((entry, index) => {
                                const error = Math.abs((entry.predicted - entry.actual) / entry.actual);
                                return <Cell key={`cell-${index}`} fill={error < 0.10 ? "#4ade80" : "#fbbf24"} />;
                            })}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
                Green points = High Accuracy (&lt;10% error) | Yellow points = Moderate Error
            </p>
        </div>
    );
};

export default ScatterAccuracyChart;
