import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import GenreSelector from "../components/GenreSelector";
import CitySelector from "../components/CitySelector";
import AvailabilitySelector from "../components/AvailabilitySelector";
import { baseGenres } from "../data/genres";

export default function DJDashboard() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [genre, setGenre] = useState([]);
  const [socials, setSocials] = useState("");
  const [cities, setCities] = useState([]);
  const [rawCityString, setRawCityString] = useState("");
  const [availability, setAvailability] = useState({
    weeklyAvailability: {},
    availabilityOverrides: {},
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      const q = query(
        collection(db, "availability"),
        where("userId", "==", auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const dates = snapshot.docs.map((doc) => doc.data().date);

      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setName(data.name || "");
        setBio(data.bio || "");
        setGenre(
          Array.isArray(data.genre)
            ? data.genre
            : data.genre?.split(",").map((g) => g.trim()) || []
        );
        setSocials(data.socials || "");
        setCities(data.cities || []);
        setRawCityString((data.cities || []).join(", "));
        setAvailability({
          weeklyAvailability: data.weeklyAvailability || {},
          availabilityOverrides: data.availabilityOverrides || {},
        });
        console.log(
          "Loaded weeklyAvailability:",
          data.weeklyAvailability || {}
        );
        console.log(
          "Loaded availabilityOverrides:",
          data.availabilityOverrides || {}
        );
      }
    };

    fetchInitialData();
  }, []);

  const handleUpdateProfile = async () => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    try {
      // Check for and log any new genres
      for (const g of genre) {
        const normalized = g.trim().toLowerCase();
        const baseMatch = baseGenres.some(
          (bg) => bg.toLowerCase() === normalized
        );
        if (!baseMatch) {
          const genreRef = doc(db, "genreSuggestions", normalized);
          await setDoc(genreRef, { name: g.trim() }, { merge: true });
        }
      }
      const parsedCities = cities;

      console.log(
        "Saving weeklyAvailability:",
        availability.weeklyAvailability
      );
      console.log(
        "Saving availabilityOverrides:",
        availability.availabilityOverrides
      );

      await updateDoc(userRef, {
        name,
        bio,
        genre,
        socials,
        cities: parsedCities,
        weeklyAvailability: availability.weeklyAvailability ?? {},
        availabilityOverrides: availability.availabilityOverrides ?? {},
      });
      alert("Profile updated!");
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen space-y-6">
      <h1 className="text-3xl font-bold">DJ Dashboard</h1>
      <div className="bg-gray-800 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Your DJ Profile</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name or DJ Name"
            className="w-full p-2 rounded text-black"
          />
          <GenreSelector genres={genre} setGenres={setGenre} />
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Short bio"
            className="w-full p-2 rounded text-black"
          />
          <input
            type="text"
            value={socials}
            onChange={(e) => setSocials(e.target.value)}
            placeholder="Social links (e.g., IG, SoundCloud)"
            className="w-full p-2 rounded text-black"
          />
          <CitySelector cities={cities} setCities={setCities} />
        </div>
      </div>
      <AvailabilitySelector
        value={availability}
        onChange={(newAvailability) => setAvailability(newAvailability)}
      />

      <button
        onClick={handleUpdateProfile}
        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Profile
      </button>
    </div>
  );
}
