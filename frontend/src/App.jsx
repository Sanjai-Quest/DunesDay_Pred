import React, { useState } from 'react';
import { predict } from './api';
import MovieSelector from './components/MovieSelector';
import ComparisonCard from './components/ComparisonCard';
import ShapChart from './components/ShapChart';
import FranchiseTrendChart from './components/FranchiseTrendChart';
import MetricRadarChart from './components/MetricRadarChart';
import InsightPanel from './components/InsightPanel';
import ScatterAccuracyChart from './components/ScatterAccuracyChart';
import './App.css';

function App() {
  const [movie1, setMovie1] = useState({
    title: 'Avengers Doomsday',
    budget: 400000000,
    release_date: '2026-12-18',
    genres: 'Action, Adventure, Science Fiction',
    crew: 'Russo Brothers, Director, Robert Downey Jr., Actor',
    score: 95
  });

  const [movie2, setMovie2] = useState({
    title: 'Dune 3',
    budget: 250000000,
    release_date: '2026-12-18',
    genres: 'Science Fiction, Adventure',
    crew: 'Denis Villeneuve, Director, Timothée Chalamet, Actor',
    score: 90
  });

  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await predict(movie1, movie2);
      setPredictions(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch predictions. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
          Box Office Clash
        </h1>
        <p className="text-gray-400">AI-Powered Revenue Prediction & Comparison</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 relative">
        <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-red-500 text-white font-black text-xl w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-gray-900">
            VS
          </div>
        </div>
        <MovieSelector label="Movie 1 (Challenger)" movieData={movie1} setMovieData={setMovie1} />
        <MovieSelector label="Movie 2 (Champion)" movieData={movie2} setMovieData={setMovie2} />
      </div>

      <div className="text-center mt-6">
        <button
          onClick={handlePredict}
          disabled={loading}
          className="btn-primary text-xl px-12 py-3 rounded-full hover:scale-105 transform transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Crunching Numbers...' : 'PREDICT WINNER'}
        </button>
        {error && <p className="text-red-400 mt-4">{error}</p>}
      </div>

      {/* RENDER ALL 5 VISUALIZATIONS */}
      {predictions && (
        <div className="mt-10 animate-fade-in-up space-y-6">

          {/* 1. Comparison Card (Values & Confidence Intervals) */}
          <ComparisonCard
            pred1={predictions.movie1}
            pred2={predictions.movie2}
            movie1={movie1}
            movie2={movie2}
          />

          {/* Insight Panel (Text Narrative) */}
          <InsightPanel movie1={movie1} movie2={movie2} prediction1={predictions.movie1} prediction2={predictions.movie2} />

          {/* 2. Franchise Trend Chart */}
          {/* Ensure the container has explicit height for Recharts */}
          <div style={{ minHeight: '350px' }}>
            <FranchiseTrendChart prediction1={predictions.movie1} prediction2={predictions.movie2} />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 3. SHAP Feature Chart */}
            <div style={{ minHeight: '350px' }}>
              <ShapChart shapData1={predictions.movie1.shap_values} shapData2={predictions.movie2.shap_values} />
            </div>

            {/* 4. Scatter Accuracy Plot */}
            <div style={{ minHeight: '350px' }}>
              <ScatterAccuracyChart />
            </div>
          </div>

          {/* 5. Metric Radar Chart (Bonus/Alternative View) */}
          <div style={{ minHeight: '350px' }}>
            <MetricRadarChart
              movie1={movie1}
              movie2={movie2}
              prediction1={predictions.movie1}
              prediction2={predictions.movie2}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
