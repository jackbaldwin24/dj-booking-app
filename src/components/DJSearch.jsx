import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { db, storage, auth } from "../firebase";
import { getDownloadURL, ref } from "firebase/storage";
import GenreSelector from "./GenreSelector";
import CitySelector from "./CitySelector";
import { format, parseISO } from "date-fns";
import DJCard from "./DJCard";

export default function DJSearch({ event, bookingRequests = [], setBookingRequests }) {
  const [djs, setDjs] = useState([]);
  const [searchName, setSearchName] = useState("");
  const params = useParams();
  const eventId = event?.id || params.eventId;
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [requestedDjIds, setRequestedDjIds] = useState([]);

  useEffect(() => {
    if (event) {
      if (event.city) setSelectedCities([event.city]);
    }
  }, [event]);

  useEffect(() => {
    const fetchDJs = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "dj"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const dataWithPics = await Promise.all(
          data.map(async (dj) => {
            try {
              const picRef = ref(storage, `profilePics/${dj.id}`);
              const url = await getDownloadURL(picRef);
              return { ...dj, profilePicUrl: url };
            } catch (err) {
              return { ...dj, profilePicUrl: null };
            }
          })
        );
        setDjs(dataWithPics);
      } catch (err) {
        console.error("Failed to fetch DJs:", err);
      }
    };

    fetchDJs();
  }, []);

  useEffect(() => {
    const ids = (bookingRequests || [])
      .filter((br) => ["pending","booked","accepted"].includes((br.status || '').toLowerCase()))
      .map((br) => br.djId);
    setRequestedDjIds(ids);
  }, [bookingRequests]);

  const filteredDjs = djs.filter((dj) => {
    if (requestedDjIds.includes(dj.id)) return false;

    const matchesGenre =
      selectedGenres.length === 0 ||
      (Array.isArray(dj.genre) && selectedGenres.some((g) => dj.genre.includes(g)));

    const matchesCity =
      selectedCities.length === 0 ||
      (Array.isArray(dj.cities) && selectedCities.some((c) => dj.cities.includes(c)));

    const selectedDate = event?.date;

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

    const matchesName =
      searchName.trim() === "" ||
      (dj.name && dj.name.toLowerCase().includes(searchName.toLowerCase()));

    return matchesGenre && matchesCity && matchesDate && matchesName;
  });

  const handleBookDJ = async (djId) => {
    // Local duplicate check (no Firestore read)
    if ((requestedDjIds || []).includes(djId)) {
      alert("You’ve already sent a booking request to this DJ for this event.");
      return;
    }

    const message = window.prompt("Enter a message for this DJ (optional):", "");
    try {
      const docRef = await addDoc(collection(db, "bookingRequests"), {
        eventId,
        djId,
        promoterId: auth.currentUser.uid,
        status: "Pending",
        message,
        timestamp: new Date(),
      });

      // Update parent bookingRequests so EventBookingRequests reflects immediately
      if (typeof setBookingRequests === "function") {
        setBookingRequests((prev) => ([
          ...(prev || []),
          {
            id: docRef.id,
            eventId,
            djId,
            promoterId: auth.currentUser.uid,
            status: "Pending",
            message,
            timestamp: new Date(),
          },
        ]));
      }

      // Optimistically hide immediately
      setRequestedDjIds((prev) => Array.from(new Set([...(prev || []), djId])));
      alert("Booking request sent!");
    } catch (error) {
      console.error("Error sending booking request:", error);
      alert("Failed to send booking request.");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">🎧 Find DJs</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="block">
          <span className="block text-sm text-gray-300 mb-1">Search</span>
          <input
            type="text"
            placeholder="Search by DJ name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-black"
          />
        </label>
        <label className="block">
          <span className="block text-sm text-gray-300 mb-1">Genres</span>
          <div className="max-w-xl">
            <GenreSelector genres={selectedGenres} setGenres={setSelectedGenres} />
          </div>
        </label>
        <label className="block">
          <span className="block text-sm text-gray-300 mb-1">Cities</span>
          <div className="max-w-xl">
            <CitySelector cities={selectedCities} setCities={setSelectedCities} />
          </div>
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredDjs.map((dj) => (
          <DJCard key={dj.id} dj={dj} onBook={() => handleBookDJ(dj.id)} />
        ))}
      </div>
    </div>
  );
}