import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { db, storage, auth } from "../firebase";
import { getDownloadURL, ref } from "firebase/storage";
import GenreSelector from "./GenreSelector";
import CitySelector from "./CitySelector";
import { format, parseISO } from "date-fns";
import {
  FaInstagram,
  FaSoundcloud,
  FaFacebook,
  FaTwitter,
  FaTiktok,
  FaLink
} from "react-icons/fa";

export default function DJSearch({ event }) {
  const [djs, setDjs] = useState([]);
  const [searchName, setSearchName] = useState("");
  const navigate = useNavigate();
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
    const fetchRequestedDjs = async () => {
      if (!eventId) return;
      try {
        const q = query(
          collection(db, "bookingRequests"),
          where("eventId", "==", eventId)
        );
        const snapshot = await getDocs(q);
        const ids = snapshot.docs.map((doc) => doc.data().djId);
        setRequestedDjIds(ids);
      } catch (err) {
        console.error("Error fetching booking requests:", err);
      }
    };
    fetchRequestedDjs();
  }, [eventId]);

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
    const existingQuery = query(
      collection(db, "bookingRequests"),
      where("eventId", "==", eventId),
      where("djId", "==", djId)
    );
    const existingSnapshot = await getDocs(existingQuery);
    if (!existingSnapshot.empty) {
      alert("You’ve already sent a booking request to this DJ for this event.");
      return;
    }

    const message = window.prompt("Enter a message for this DJ (optional):", "");
    try {
      await addDoc(collection(db, "bookingRequests"), {
        eventId,
        djId,
        promoterId: auth.currentUser.uid,
        status: "pending",
        message,
        timestamp: new Date(),
      });
      alert("Booking request sent!");
    } catch (error) {
      console.error("Error sending booking request:", error);
      alert("Failed to send booking request.");
    }
  };

  return (
    <div className="p-6 space-y-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold">🎧 Find DJs</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by DJ name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="w-full p-2 rounded text-black"
        />
      </div>
      <div className="mb-4">
        <GenreSelector genres={selectedGenres} setGenres={setSelectedGenres} />
      </div>
      <div className="mb-4">
        <CitySelector cities={selectedCities} setCities={setSelectedCities} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDjs.map((dj) => (
          <div
            key={dj.id}
            className="bg-gray-800 p-4 rounded shadow border border-gray-700"
          >
            {dj.profilePicUrl && (
              <img
                src={dj.profilePicUrl}
                alt={`${dj.name}'s profile`}
                className="w-24 h-24 rounded-full object-cover mb-2"
              />
            )}
            <h2 className="text-xl font-bold mb-1">{dj.name || "Unnamed DJ"}</h2>
            {dj.bio && (
              <p className="mb-2">{dj.bio}</p>
            )}
            {dj.email && (
              <p className="mb-2 text-sm text-gray-300">
                <strong>Email:</strong> {dj.email}
              </p>
            )}
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
            <div className="flex space-x-4 mt-2">
              {dj.socials?.instagram && (
                <a href={dj.socials.instagram} target="_blank" rel="noopener noreferrer">
                  <FaInstagram className="w-6 h-6 text-pink-500 hover:text-pink-600" />
                </a>
              )}
              {dj.socials?.soundcloud && (
                <a href={dj.socials.soundcloud} target="_blank" rel="noopener noreferrer">
                  <FaSoundcloud className="w-6 h-6 text-orange-500 hover:text-orange-600" />
                </a>
              )}
              {dj.socials?.facebook && (
                <a href={dj.socials.facebook} target="_blank" rel="noopener noreferrer">
                  <FaFacebook className="w-6 h-6 text-blue-600 hover:text-blue-700" />
                </a>
              )}
              {dj.socials?.twitter && (
                <a href={dj.socials.twitter} target="_blank" rel="noopener noreferrer">
                  <FaTwitter className="w-6 h-6 text-blue-400 hover:text-blue-500" />
                </a>
              )}
              {dj.socials?.tiktok && (
                <a href={dj.socials.tiktok} target="_blank" rel="noopener noreferrer">
                  <FaTiktok className="w-6 h-6 text-black hover:text-gray-700" />
                </a>
              )}
              {dj.socials?.other && (
                <a href={dj.socials.other} target="_blank" rel="noopener noreferrer">
                  <FaLink className="w-6 h-6 text-white hover:text-gray-400" />
                </a>
              )}
              {dj.socials?.website && (
                <a href={dj.socials.website} target="_blank" rel="noopener noreferrer">
                  <FaLink className="w-6 h-6 text-green-400 hover:text-green-500" />
                </a>
              )}
            </div>
            {dj.epkUrl && (
              <div className="mt-2">
                <a
                  href={dj.epkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  View EPK
                </a>
              </div>
            )}
            <div className="mt-2">
              <button
                onClick={() => handleBookDJ(dj.id)}
                className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Book DJ
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}