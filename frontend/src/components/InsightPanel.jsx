import React from 'react';

const InsightPanel = ({ movie1, movie2, prediction1, prediction2 }) => {
    if (!prediction1 || !prediction2) return null;

    const winner = prediction1.opening_weekend > prediction2.opening_weekend ? movie1 : movie2;
    const diff = Math.abs(prediction1.opening_weekend - prediction2.opening_weekend) / 1000000;

    // Identify Key Drivers (Logic from SHAP values)
    const getTopDriver = (shap) => {
        if (!shap) return "General Appeal";
        const sorted = Object.entries(shap).sort(([, a], [, b]) => b - a);
        const top = sorted[0];
        // Map common keys to nice names
        const map = {
            'log_budget': 'Production Budget',
            'log_star_power': 'Franchise/Star Power',
            'score': 'Early Audience Score',
            'Science_Fiction': 'Sci-Fi Genre Popularity'
        };
        return map[top[0]] || top[0];
    };

    const winnerDriver = getTopDriver(
        winner === movie1 ? prediction1.shap_values : prediction2.shap_values
    );

    // Helper for badges
    const renderBadges = (pred, label) => {
        const flags = pred.context_flags || {};
        return (
            <div className="flex flex-wrap gap-2 mt-2">
                {flags.is_estimated && (
                    <span className="px-2 py-0.5 rounded text-xs bg-yellow-900 text-yellow-300 border border-yellow-700">
                        ⚠️ Est. Budget
                    </span>
                )}
                {flags.high_marketing && (
                    <span className="px-2 py-0.5 rounded text-xs bg-pink-900 text-pink-300 border border-pink-700">
                        🔥 High Hype
                    </span>
                )}
                {flags.franchise_legacy && (
                    <span className="px-2 py-0.5 rounded text-xs bg-purple-900 text-purple-300 border border-purple-700">
                        👑 Franchise Legacy
                    </span>
                )}
            </div>
        )
    };

    return (
        <div className="glass-panel p-6 mt-6 border-l-4 border-green-400">
            <h3 className="text-xl font-bold mb-3 text-white">AI Prediction Insight 🧠</h3>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <p className="text-gray-300 text-lg leading-relaxed mb-4">
                        The model predicts <strong className={winner === movie1 ? "text-red-400" : "text-blue-400"}>{winner.title}</strong> will
                        outperform by <strong className="text-green-400">${diff.toFixed(1)}M</strong>.
                    </p>
                    <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                        <p className="text-gray-400 text-xs uppercase font-bold mb-1">Generated Explanation</p>
                        <p className="text-gray-200 text-sm italic">
                            "{winner === movie1 ? prediction1.explanation : prediction2.explanation}"
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="p-3 bg-gray-900 rounded-lg">
                        <p className="text-gray-400 text-xs uppercase font-bold mb-1">Key Winning Factor</p>
                        <p className="text-white text-sm">
                            {winnerDriver} (Historical Strongest Predictor)
                        </p>
                    </div>

                    <div className="p-3 bg-gray-900 rounded-lg">
                        <p className="text-gray-400 text-xs uppercase font-bold mb-1">Context Signals</p>
                        <div className="space-y-2">
                            <div>
                                <span className="text-xs text-gray-500 block">{movie1.title}</span>
                                {renderBadges(prediction1)}
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 block">{movie2.title}</span>
                                {renderBadges(prediction2)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InsightPanel;
