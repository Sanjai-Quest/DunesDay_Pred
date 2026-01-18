import React from 'react';
import { motion } from 'framer-motion';
import MediaGallery from './MediaGallery';

const StatRow = ({ label, val1, val2, format = (v) => v }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
        <span className="text-gray-400 w-1/3">{label}</span>
        <span className="text-white font-mono w-1/3 text-right">{format(val1)}</span>
        <span className="text-white font-mono w-1/3 text-right text-cyan-400">{format(val2)}</span>
    </div>
);

const ComparisonCard = ({ pred1, pred2, movie1, movie2 }) => {

    // Fallback names
    const movie1Name = movie1?.title || "Movie 1";
    const movie2Name = movie2?.title || "Movie 2";
    const formatCurrency = (val) => {
        if (!val) return '-';
        // Format to Millions
        const millions = val / 1000000;
        return `$${millions.toFixed(1)}M`;
    };

    const formatROI = (val) => {
        if (!val) return '-';
        const color = val > 0 ? 'text-green-400' : 'text-red-400';
        return <span className={color}>{val.toFixed(2)}x</span>;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 w-full max-w-4xl mx-auto mt-6"
        >
            <div className="flex justify-between mb-6 border-b border-gray-600 pb-2">
                <h2 className="text-2xl font-bold w-1/3 truncate text-red-500">{movie1Name || "Movie 1"}</h2>
                <span className="text-gray-500 font-bold">VS</span>
                <h2 className="text-2xl font-bold w-1/3 text-right truncate text-blue-500">{movie2Name || "Movie 2"}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <MediaGallery movieTitle={movie1Name} />
                <MediaGallery movieTitle={movie2Name} />
            </div>

            <div className="space-y-2">
                <StatRow
                    label="Opening Weekend"
                    val1={pred1?.opening_weekend}
                    val2={pred2?.opening_weekend}
                    format={formatCurrency}
                />
                <div className="flex justify-between text-xs text-gray-500 mb-2 px-1">
                    <span>CI: {formatCurrency(pred1?.opening_ci_lower)} - {formatCurrency(pred1?.opening_ci_upper)}</span>
                    <span>CI: {formatCurrency(pred2?.opening_ci_lower)} - {formatCurrency(pred2?.opening_ci_upper)}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400 w-1/3">Budget</span>
                    <span className="text-white font-mono w-1/3 text-right">
                        {formatCurrency(movie1?.budget)}
                        {movie1?.is_estimated_budget && <span className="text-xs text-yellow-500 ml-1">(Est.)</span>}
                    </span>
                    <span className="text-white font-mono w-1/3 text-right text-cyan-400">
                        {formatCurrency(movie2?.budget)}
                        {movie2?.is_estimated_budget && <span className="text-xs text-yellow-500 ml-1">(Est.)</span>}
                    </span>
                </div>

                <StatRow
                    label="Total Gross"
                    val1={pred1?.revenue}
                    val2={pred2?.revenue}
                    format={formatCurrency}
                />

                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400 w-1/3">Franchise Score</span>
                    <span className="text-white font-mono w-1/3 text-right text-yellow-500">{pred1?.star_power?.toFixed(0)}/100</span>
                    <span className="text-white font-mono w-1/3 text-right text-yellow-500">{pred2?.star_power?.toFixed(0)}/100</span>
                </div>

                <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400 w-1/3">ROI (Multiplier)</span>
                    <span className="w-1/3 text-right font-mono">{formatROI(pred1?.roi)}</span>
                    <span className="w-1/3 text-right font-mono">{formatROI(pred2?.roi)}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default ComparisonCard;
