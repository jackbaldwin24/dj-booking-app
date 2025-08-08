

import { useState, useEffect } from "react";
import { baseGenres } from "../data/genres";

export default function GenreSelector({
  genres,
  setGenres,
  singleSelect = false,
  placeholder = "Start typing a genre...",
}) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Keep input in sync when singleSelect is enabled
  useEffect(() => {
    if (singleSelect) {
      setInput(genres[0] || "");
    }
  }, [genres, singleSelect]);

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);

    const filtered = baseGenres
      .filter((g) => g.toLowerCase().startsWith(value.toLowerCase()))
      .slice(0, 10);

    setSuggestions(filtered);
  };

  const handleSelect = (genre) => {
    if (!genres.includes(genre)) {
      if (singleSelect) {
        setGenres([genre]);
        setInput(genre);
        setSuggestions([]);
      } else {
        setGenres([...genres, genre]);
      }
    }
    if (!singleSelect) {
      setInput("");
      setSuggestions([]);
    }
  };

  const handleRemove = (index) => {
    const updated = [...genres];
    updated.splice(index, 1);
    setGenres(updated);
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={input}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-black"
      />

      {singleSelect && genres.length > 0 && (
        <button
          onClick={() => {
            setGenres([]);
            setInput("");
          }}
          className="text-sm text-blue-600 hover:underline"
        >
          Clear
        </button>
      )}

      {suggestions.length > 0 && (
        <ul className="bg-white text-black rounded shadow max-h-48 overflow-y-auto">
          {suggestions.map((g) => (
            <li
              key={g}
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleSelect(g)}
            >
              {g}
            </li>
          ))}
        </ul>
      )}

      {!singleSelect && (
        <div className="flex flex-wrap gap-2 mt-2">
          {genres.map((g, i) => (
            <div
              key={`${g}-${i}`}
              className="bg-purple-600 text-white px-3 py-1 rounded-full flex items-center gap-2 shadow-sm"
            >
              {g}
              <button
                onClick={() => handleRemove(i)}
                className="text-white hover:text-red-400 focus:outline-none"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}