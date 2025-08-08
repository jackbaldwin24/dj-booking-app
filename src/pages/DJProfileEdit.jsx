import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import GenreSelector from "../components/GenreSelector";
import CitySelector from "../components/CitySelector";
import AvailabilitySelector from "../components/AvailabilitySelector";
import { baseGenres } from "../data/genres";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ProfileEdit() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [genre, setGenre] = useState([]);
  const [socials, setSocials] = useState({
    soundcloud: "",
    instagram: "",
    facebook: "",
    twitter: "",
    tiktok: "",
    youtube: "",
    website: ""
  });
  const [cities, setCities] = useState([]);
  const [rawCityString, setRawCityString] = useState("");
  const [availability, setAvailability] = useState({
    weeklyAvailability: {},
    availabilityOverrides: {},
  });
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [epkFile, setEpkFile] = useState(null);
  const [epkUrl, setEpkUrl] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const uploadProfilePic = async () => {
      if (profilePic) {
        try {
          const storage = getStorage();
          const storageRef = ref(storage, `profilePics/${auth.currentUser.uid}`);
          await uploadBytes(storageRef, profilePic);
          const uploadedUrl = await getDownloadURL(storageRef);
          setProfilePicUrl(uploadedUrl);
          await updateDoc(doc(db, "users", auth.currentUser.uid), {
            profilePicUrl: uploadedUrl
          });
        } catch (error) {
          console.error("Error uploading profile pic:", error);
        }
      }
    };
    uploadProfilePic();
  }, [profilePic]);

  useEffect(() => {
    const uploadEpk = async () => {
      if (epkFile) {
        try {
          const storage = getStorage();
          const epkRef = ref(storage, `epks/${auth.currentUser.uid}`);
          await uploadBytes(epkRef, epkFile, { contentType: epkFile.type });
          const uploadedUrl = await getDownloadURL(epkRef);
          setEpkUrl(uploadedUrl);
          await updateDoc(doc(db, "users", auth.currentUser.uid), {
            epkUrl: uploadedUrl
          });
        } catch (error) {
          console.error("Error uploading EPK:", error);
        }
      }
    };
    uploadEpk();
  }, [epkFile]);

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
        setSocials({
          soundcloud: data.socials?.soundcloud || "",
          instagram: data.socials?.instagram || "",
          facebook: data.socials?.facebook || "",
          twitter: data.socials?.twitter || "",
          tiktok: data.socials?.tiktok || "",
          youtube: data.socials?.youtube || "",
          website: data.socials?.website || ""
        });
        setCities(data.cities || []);
        setRawCityString((data.cities || []).join(", "));
        setAvailability({
          weeklyAvailability: data.weeklyAvailability || {},
          availabilityOverrides: data.availabilityOverrides || {},
        });
        if (data.profilePicUrl) {
          setProfilePicUrl(data.profilePicUrl);
        }
        if (data.epkUrl) {
          setEpkUrl(data.epkUrl);
        }
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

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Warn user if navigating away using browser's back button with unsaved changes
  useEffect(() => {
    const handlePopState = (e) => {
      if (hasUnsavedChanges) {
        const confirmLeave = window.confirm("You have unsaved changes. Are you sure you want to leave?");
        if (!confirmLeave) {
          window.history.pushState(null, null, window.location.pathname);
        }
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges]);

  const handleUpdateProfile = async () => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    try {
      // Validation: Name required
      if (!name.trim()) {
        alert("Name is required");
        return;
      }
      // Validation: At least one city
      if (!Array.isArray(cities) || cities.length === 0) {
        alert("Please add at least one city");
        return;
      }
      // (Removed: Check for and log any new genres)
      const parsedCities = cities;

      // Add https:// prefix to socials.website if missing
      if (socials.website && !socials.website.startsWith("http://") && !socials.website.startsWith("https://")) {
        socials.website = "https://" + socials.website;
      }

      // Validation: All social links (non-empty) must be valid URLs
      const urlRegex = /^(https?:\/\/)?([\w.-]+)\.[a-z]{2,}(\/\S*)?$/i;
      for (const [platform, link] of Object.entries(socials)) {
        if (link && !urlRegex.test(link)) {
          alert(`Invalid URL format for ${platform}`);
          return;
        }
      }

      console.log(
        "Saving weeklyAvailability:",
        availability.weeklyAvailability
      );
      console.log(
        "Saving availabilityOverrides:",
        availability.availabilityOverrides
      );

      await setDoc(userRef, {
        name,
        bio,
        genre,
        socials,
        cities: parsedCities,
        weeklyAvailability: availability.weeklyAvailability ?? {},
        availabilityOverrides: availability.availabilityOverrides ?? {},
        profilePicUrl,
        epkUrl
      }, { merge: true });
      alert("Profile updated!");
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const saveProfileButton = (
    <button
      onClick={handleUpdateProfile}
      className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
    >
      Save Profile
    </button>
  );
  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen space-y-6">
      <div className="bg-gray-800 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Your DJ Profile</h2>
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Profile Picture</label>
            <p className="text-xs text-gray-400 mb-1">(Displays on your public profile)</p>
            <div className="flex items-center gap-6">
              {profilePicUrl && (
                <img
                  src={profilePicUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-600"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePic(e.target.files[0])}
                className="file:bg-blue-600 file:text-white file:px-3 file:py-1 file:rounded file:border-none file:hover:bg-blue-700 cursor-pointer text-sm text-gray-300"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Upload EPK (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setEpkFile(e.target.files[0])}
              className="file:bg-blue-600 file:text-white file:px-3 file:py-1 file:rounded file:border-none file:hover:bg-blue-700 cursor-pointer text-sm text-gray-300"
            />
            {epkUrl && (
              <a
                href={epkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline hover:text-blue-500 text-sm"
              >
                View Current EPK
              </a>
            )}
          </div>
          <div className="flex justify-end">
            {saveProfileButton}
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setHasUnsavedChanges(true);
            }}
            placeholder="Your Name or DJ Name"
            className="w-full sm:w-1/2 p-2 rounded text-black"
          />
          <GenreSelector genres={genre} setGenres={(newGenres) => { setGenre(newGenres); setHasUnsavedChanges(true); }} />
          <textarea
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              setHasUnsavedChanges(true);
            }}
            placeholder="Short bio"
            className="w-full p-2 rounded text-black"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="url"
              value={socials.website}
              onChange={(e) => {
                setSocials({ ...socials, website: e.target.value });
                setHasUnsavedChanges(true);
              }}
              placeholder="Website or Linktr.ee URL"
              className="w-full sm:w-1/2 p-2 rounded text-black"
            />
          </div>
          <CitySelector cities={cities} setCities={(newCities) => { setCities(newCities); setHasUnsavedChanges(true); }} />
        </div>
      </div>
      <AvailabilitySelector
        value={availability}
        onChange={(newAvailability) => {
          setAvailability(newAvailability);
          setHasUnsavedChanges(true);
        }}
      />


    </div>
  );
}
