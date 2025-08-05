import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import GenreSelector from "../components/GenreSelector";
import CitySelector from "../components/CitySelector";
import { format, parseISO } from "date-fns";

export default function PromoterDashboard() {
  const [djs, setDjs] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchDJs = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "dj"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDjs(data);
      } catch (err) {
        console.error("Failed to fetch DJs:", err);
      }
    };

    fetchDJs();
  }, []);

  const filteredDjs = djs.filter((dj) => {
    const matchesGenre =
      selectedGenres.length === 0 ||
      (Array.isArray(dj.genre) && selectedGenres.some((g) => dj.genre.includes(g)));

    const matchesCity =
      selectedCities.length === 0 ||
      (Array.isArray(dj.cities) && selectedCities.some((c) => dj.cities.includes(c)));

    const matchesDate =
      !selectedDate ||
      (() => {
        const dayOfWeek = format(parseISO(selectedDate), "EEEE");
        const overrides = dj.availabilityOverrides || {};
        const weekly = dj.weeklyAvailability || {};
        if (selectedDate in overrides) {
          return overrides[selectedDate] === true;
        }
        return weekly[dayOfWeek] === true;
      })();

    return matchesGenre && matchesCity && matchesDate;
  });

  return (
    <div className="p-6 space-y-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold">🎧 Find DJs</h1>
      <div className="mb-4">
        <GenreSelector genres={selectedGenres} setGenres={setSelectedGenres} />
      </div>
      <div className="mb-4">
        <CitySelector cities={selectedCities} setCities={setSelectedCities} />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Select Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="p-2 rounded text-black"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDjs.map((dj) => (
          <div
            key={dj.id}
            className="bg-gray-800 p-4 rounded shadow border border-gray-700"
          >
            <h2 className="text-xl font-bold mb-1">{dj.name || "Unnamed DJ"}</h2>
            <p>
              <strong>Genres:</strong> {Array.isArray(dj.genre) ? dj.genre.join(", ") : "None"}
            </p>
            <p>
              <strong>Cities:</strong>
            </p>
            {Array.isArray(dj.cities) && dj.cities.length > 0 ? (
              <div className="ml-2">
                {dj.cities.map((city, idx) => (
                  <div key={idx}>{city}</div>
                ))}
              </div>
            ) : (
              <p className="ml-2">None</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}