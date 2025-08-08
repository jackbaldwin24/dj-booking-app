import { useState, useEffect } from "react";
import citiesData from "../data/cities.json";

export default function CitySelector({ cities, setCities, singleSelect = false }) {
    const [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        if (singleSelect) {
            setInput(cities[0] || "");
        }
    }, [cities, singleSelect]);

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
            if (singleSelect) {
                setCities([formatted]);
                setInput(formatted);
                setSuggestions([]);
            } else {
                setCities([...cities, formatted]);
            }
        }
        if (!singleSelect) {
            setInput("");
            setSuggestions([]);
        }
    };

    const handleRemove = (index) => {
        const updated = [...cities];
        updated.splice(index, 1);
        setCities(updated);
    };

    return (
        <div className="space-y-2">
            <input
                type="text"
                value={input}
                onChange={handleChange}
                placeholder="Start typing a city..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-black"
            />
            {singleSelect && cities.length > 0 && (
                <button
                    onClick={() => {
                        setCities([]);
                        setInput("");
                    }}
                    className="text-sm text-blue-600 hover:underline"
                >
                    Clear
                </button>
            )}
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

            {!singleSelect && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {cities.map((city, i) => (
                        <div
                            key={i}
                            className="bg-purple-600 text-white px-3 py-1 rounded-full flex items-center gap-2 shadow-sm"
                        >
                            {city}
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
