import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const PredictionGauge = ({ shapData, movieName }) => {
    if (!shapData) return null;

    // Define Categories and Feature Mapping
    const categories = {
        'Budget & Scale': ['log_budget'],
        'Star Power': ['log_star_power'],
        'Audience Reach': ['score', 'vote_count'],
        'Seasonality': ['release_year', 'release_month', 'release_quarter'],
        'Genre & Content': ['science_fiction', 'action', 'adventure', 'drama', 'comedy', 'thriller', 'horror', 'romance', 'fantasy', 'animation']
    };

    // Aggregate contributions
    const aggregated = {
        'Budget & Scale': 0,
        'Star Power': 0,
        'Audience Reach': 0,
        'Seasonality': 0,
        'Genre & Content': 0,
        'Other': 0
    };

    Object.entries(shapData).forEach(([feature, value]) => {
        const absVal = Math.abs(value); // Use absolute impact
        let matched = false;

        for (const [cat, features] of Object.entries(categories)) {
            // Check exact match or partial match for genres (e.g. 'Science_Fiction' vs 'science_fiction')
            if (features.includes(feature) || features.some(f => feature.toLowerCase().includes(f))) {
                aggregated[cat] += absVal;
                matched = true;
                break;
            }
        }

        if (!matched) {
            aggregated['Other'] += absVal;
        }
    });

    // Convert to Chart Data
    const data = Object.entries(aggregated)
        .map(([name, value]) => ({ name, value }))
        .filter(d => d.value > 0); // Remove empty categories

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#8884d8'];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-gray-900 border border-gray-700 p-2 rounded shadow-xl">
                    <p className="font-bold text-white text-sm">{data.name}</p>
                    <p className="text-gray-300 text-xs text-right">
                        Impact: ${(data.value / 1000000).toFixed(1)}M
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        if (percent < 0.05) return null; // Don't label small slices
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10}>
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="glass-panel p-4 h-full flex flex-col items-center">
            <h3 className="text-lg font-bold mb-2 text-white truncate w-full text-center">
                Prediction Drivers: <span className="text-cyan-400">{movieName}</span>
            </h3>
            <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label={renderCustomizedLabel}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconSize={10} wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PredictionGauge;
