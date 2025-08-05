

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
            <label className="block font-semibold">Genres</label>
            <input
                list="genre-options"
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                onKeyDown={handleAddGenre}
                placeholder={placeholder}
                className="w-full p-2 rounded text-black"
            />
            <datalist id="genre-options">
                {baseGenres.map((g) => (
                    <option key={g} value={g} />
                ))}
            </datalist>
            <div className="flex flex-wrap gap-2 mt-2">
                {genres.map((g) => (
                    <span key={g} className="bg-blue-700 text-white px-2 py-1 rounded text-sm flex items-center gap-2">
                        {g}
                        <button
                            onClick={() => handleRemoveGenre(g)}
                            className="text-white hover:text-red-400 focus:outline-none"
                        >
                            ✕
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
}