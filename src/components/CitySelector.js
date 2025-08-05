import { useState } from "react";
import citiesData from "../data/cities.json";

export default function CitySelector({ cities, setCities }) {
    const [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    const handleChange = (e) => {
        const value = e.target.value;
        setInput(value);

        const filtered = citiesData
            .filter((entry) => {
                const cityState = `${entry.city}, ${entry.state}`.toLowerCase();
                return cityState.startsWith(value.toLowerCase());
            })
            .slice(0, 10);

        setSuggestions(filtered);
    };

    const handleSelect = (cityObj) => {
        const formatted = `${cityObj.city}, ${cityObj.state}`;
        if (!cities.includes(formatted)) {
            setCities([...cities, formatted]);
        }
        setInput("");
        setSuggestions([]);
    };

    const handleRemove = (index) => {
        const updated = [...cities];
        updated.splice(index, 1);
        setCities(updated);
    };

    return (
        <div className="space-y-2">
            <label className="block font-semibold">📍 Cities</label>
            <input
                type="text"
                value={input}
                onChange={handleChange}
                placeholder="Start typing a city..."
                className="w-full p-2 rounded text-black"
            />
            {suggestions.length > 0 && (
                <ul className="bg-white text-black rounded shadow max-h-48 overflow-y-auto">
                    {suggestions.map((cityObj, i) => (
                        <li
                            key={`${cityObj.city}-${cityObj.state}`}
                            className="p-2 hover:bg-gray-200 cursor-pointer"
                            onClick={() => handleSelect(cityObj)}
                        >
                            {cityObj.city}, {cityObj.state}
                        </li>
                    ))}
                </ul>
            )}

            <div className="flex flex-wrap gap-2 mt-2">
                {cities.map((city, i) => (
                    <div
                        key={i}
                        className="bg-blue-600 text-white px-2 py-1 rounded flex items-center gap-2"
                    >
                        {city}
                        <button
                            onClick={() => handleRemove(i)}
                            className="text-white hover:text-red-300"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
