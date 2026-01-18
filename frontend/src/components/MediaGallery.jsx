import React, { useState, useEffect } from 'react';
import { fetchMedia } from '../api';
import { motion } from 'framer-motion';

const MediaGallery = ({ movieTitle }) => {
    const [media, setMedia] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTrailer, setActiveTrailer] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const loadMedia = async () => {
            setLoading(true);
            const data = await fetchMedia(movieTitle);
            if (isMounted && data) {
                setMedia(data);
                if (data.trailers && data.trailers.length > 0) {
                    setActiveTrailer(data.trailers[0]);
                }
            }
            if (isMounted) setLoading(false);
        };

        if (movieTitle) {
            loadMedia();
        }
        return () => { isMounted = false; };
    }, [movieTitle]);

    if (loading) return <div className="animate-pulse h-64 bg-gray-800 rounded-lg"></div>;
    if (!media || !media.found) return null; // Or some placeholder

    return (
        <div className="media-gallery space-y-4">

            {/* Poster & Backdrop Combo Area */}
            <div className="relative rounded-lg overflow-hidden shadow-2xl group border border-gray-700">
                {/* Backdrop as blur background */}
                {media.backdrop_url && (
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm"
                        style={{ backgroundImage: `url(${media.backdrop_url})` }}
                    />
                )}

                <div className="relative z-10 p-4 flex flex-col items-center">
                    <motion.img
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={media.poster_url || "https://via.placeholder.com/300x450?text=No+Poster"}
                        alt={`${movieTitle} Poster`}
                        className="w-48 rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-shadow duration-300"
                    />
                </div>
            </div>

            {/* Trailer Section */}
            {activeTrailer ? (
                <div className="trailer-section bg-gray-900 rounded-lg p-2 border border-gray-800">
                    <div className="aspect-w-16 aspect-h-9 mb-2">
                        <iframe
                            src={`https://www.youtube.com/embed/${activeTrailer.key}`}
                            title={activeTrailer.name}
                            className="w-full h-64 rounded-lg"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                    <div className="p-2">
                        <h4 className="text-sm font-semibold text-cyan-400 truncate">{activeTrailer.name}</h4>
                        {activeTrailer.name.includes("[Related]") && (
                            <span className="text-xs text-yellow-500 bg-yellow-900/30 px-2 py-0.5 rounded">Fallback Content</span>
                        )}
                    </div>

                    {/* Trailer Selector */}
                    {media.trailers.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 mt-2 scrollbar-thin scrollbar-thumb-gray-700">
                            {media.trailers.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveTrailer(t)}
                                    className={`flex-shrink-0 text-xs px-3 py-1 rounded-full border ${activeTrailer.id === t.id
                                            ? 'bg-cyan-900 border-cyan-500 text-cyan-100'
                                            : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                                        }`}
                                >
                                    {t.type} {t.name.includes(movieTitle) ? "" : "Search Result"}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center p-4 text-gray-500 text-sm italic border border-gray-800 rounded-lg">
                    No trailers found
                </div>
            )}
        </div>
    );
};

export default MediaGallery;
