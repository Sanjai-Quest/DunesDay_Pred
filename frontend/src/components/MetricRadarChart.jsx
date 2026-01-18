import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

const MetricRadarChart = ({ movie1, movie2, prediction1, prediction2 }) => {
    // Helper to normalize values 0-100
    const normalize = (val, max) => Math.min(100, Math.max(0, (val / max) * 100));

    // Heuristics for "Release Timing" (Summer/Holiday = high)
    const getSeasonalScore = (dateStr) => {
        const month = new Date(dateStr).getMonth() + 1;
        if (month === 5 || month === 6 || month === 7 || month === 12) return 95; // Summer/Holiday
        if (month === 11 || month === 4) return 80;
        return 60;
    };

    // Genre score (Action/Sci-Fi usually high grossing)
    const getGenreScore = (genres) => {
        if (!genres) return 50;
        const g = genres.toLowerCase();
        if (g.includes('action') || g.includes('adventure')) return 90;
        if (g.includes('science fiction')) return 85;
        if (g.includes('animation')) return 80;
        return 60;
    };

    const data = [
        {
            subject: 'Budget Scale',
            A: normalize(movie1.budget, 400000000), // Normalize against huge blockbuster budget
            B: normalize(movie2.budget, 400000000),
            fullMark: 100,
        },
        {
            subject: 'Star Power',
            A: prediction1 ? prediction1.star_power : 50,
            B: prediction2 ? prediction2.star_power : 50,
            fullMark: 100,
        },
        {
            subject: 'Audience Score',
            A: movie1.score,
            B: movie2.score,
            fullMark: 100,
        },
        {
            subject: 'Release Hype',
            A: getSeasonalScore(movie1.release_date),
            B: getSeasonalScore(movie2.release_date),
            fullMark: 100,
        },
        {
            subject: 'Genre Trend',
            A: getGenreScore(movie1.genres),
            B: getGenreScore(movie2.genres),
            fullMark: 100,
        },
    ];

    return (
        <div className="glass-panel p-6 mt-6">
            <h3 className="text-xl font-bold mb-4 text-white text-center">Cinematic DNA Comparison</h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />

                        <Radar
                            name="Avengers"
                            dataKey="A"
                            stroke="#ef4444"
                            strokeWidth={3}
                            fill="#ef4444"
                            fillOpacity={0.3}
                        />
                        <Radar
                            name="Dune"
                            dataKey="B"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fill="#3b82f6"
                            fillOpacity={0.3}
                        />
                        <Legend />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
                Visualizing relative strengths across 5 key dimensions
            </p>
        </div>
    );
};

export default MetricRadarChart;
