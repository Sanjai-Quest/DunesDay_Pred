import React, { useState } from 'react';
import CreatableSelect from 'react-select/creatable';

const customStyles = {
    control: (base, state) => ({
        ...base,
        background: 'rgba(0, 0, 0, 0.3)',
        borderColor: state.isFocused ? '#8b5cf6' : 'rgba(255, 255, 255, 0.1)',
        color: 'white',
        padding: '4px',
        borderRadius: '8px',
    }),
    menu: (base) => ({
        ...base,
        background: '#1e232d',
        border: '1px solid rgba(255, 255, 255, 0.1)',
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? '#8b5cf6' : 'transparent',
        color: 'white',
        cursor: 'pointer',
    }),
    singleValue: (base) => ({
        ...base,
        color: 'white',
    }),
    input: (base) => ({
        ...base,
        color: 'white',
    }),
};

// Mock list of existing movies for autocomplete (In reality, fetch this from backend if needed)
// For now, we allow users to type anything (Creatable)
const defaultOptions = [
    { value: 'Avengers Doomsday', label: 'Avengers Doomsday' },
    { value: 'Dune 3', label: 'Dune 3' },
    { value: 'Avatar: The Way of Water', label: 'Avatar: The Way of Water' },
    { value: 'Oppenheimer', label: 'Oppenheimer' },
    { value: 'Titanic', label: 'Titanic' },
];

const MovieSelector = ({ label, movieData, setMovieData, onSelect }) => {
    const [mode, setMode] = useState('simple'); // 'simple' or 'advanced'

    const handleChange = (field, value) => {
        setMovieData({ ...movieData, [field]: value });
    };

    const handleBudgetChange = (val) => {
        // Input is in Millions, store as raw (e.g. 200 -> 200,000,000)
        const numeric = parseFloat(val) || 0;
        handleChange('budget', numeric * 1000000);
    };

    const handleSelectChange = (newValue) => {
        // If we had a backend lookup, we'd pre-fill data here
        handleChange('title', newValue ? newValue.value : '');
    };

    return (
        <div className="glass-panel p-6 mb-4">
            <h3 className="text-xl font-bold mb-4 text-primary-400">{label}</h3>

            <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">Movie Title</label>
                <CreatableSelect
                    isClearable
                    onChange={handleSelectChange}
                    options={defaultOptions}
                    styles={customStyles}
                    placeholder="Select or type movie title..."
                    value={movieData.title ? { label: movieData.title, value: movieData.title } : null}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Budget ($M)</label>
                    <input
                        type="number"
                        value={movieData.budget ? movieData.budget / 1000000 : ''}
                        onChange={(e) => handleBudgetChange(e.target.value)}
                        className="input-field"
                        placeholder="e.g. 200"
                    />
                    <label className="flex items-center space-x-2 mt-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={movieData.is_estimated_budget || false}
                            onChange={(e) => setMovieData({ ...movieData, is_estimated_budget: e.target.checked })}
                            className="form-checkbox text-cyan-500 rounded bg-gray-800 border-gray-600"
                        />
                        <span className="text-xs text-gray-400">Estimated / Unconfirmed Budget</span>
                    </label>
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Release Date</label>
                    <input
                        type="date"
                        className="input-field"
                        value={movieData.release_date}
                        onChange={(e) => handleChange('release_date', e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Genres</label>
                    <input
                        type="text"
                        className="input-field"
                        value={movieData.genres}
                        onChange={(e) => handleChange('genres', e.target.value)}
                        placeholder="Action, Adventure..."
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Star/Director</label>
                    <input
                        type="text"
                        className="input-field"
                        value={movieData.crew}
                        onChange={(e) => handleChange('crew', e.target.value)}
                        placeholder="Tom Cruise, Spielberg..."
                    />
                </div>
            </div>
        </div>
    );
};

export default MovieSelector;
