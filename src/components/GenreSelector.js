

import React, { useState } from "react";
import { baseGenres } from "../data/genres";

export default function GenreSelector({ genres, setGenres, placeholder = "Type a genre and press Enter" }) {
    const [genreInput, setGenreInput] = useState("");

    const handleAddGenre = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const newGenre = genreInput.trim();
            const alreadySelected = genres.includes(newGenre);
            if (newGenre && !alreadySelected) {
                setGenres([...genres, newGenre]);
            }
            setGenreInput("");
        }
    };

    const handleRemoveGenre = (g) => {
        setGenres(genres.filter((item) => item !== g));
    };

    return (
        <div>
            <input
                list="genre-options"
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                onKeyDown={handleAddGenre}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-black"
            />
            <datalist id="genre-options">
                {baseGenres.map((g) => (
                    <option key={g} value={g} />
                ))}
            </datalist>
            <div className="flex flex-wrap gap-2 mt-2">
                {genres.map((g) => (
                    <span key={g} className="bg-purple-600 text-white px-3 py-1 rounded-full flex items-center gap-2 shadow-sm">
                        {g}
                        <button
                            onClick={() => handleRemoveGenre(g)}
                            className="text-white hover:text-red-400 focus:outline-none"
                        >
                            &times;
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
}