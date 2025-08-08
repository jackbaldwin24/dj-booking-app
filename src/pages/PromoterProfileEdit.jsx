import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import GenreSelector from "../components/GenreSelector";
import CitySelector from "../components/CitySelector";

export default function PromoterProfileEdit() {
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");
  const [genresInterested, setGenresInterested] = useState([]);
  const [cities, setCities] = useState([]);
  const [venues, setVenues] = useState(""); // comma-separated
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  // Load existing promoter profile
  useEffect(() => {
    const load = async () => {
      try {
        const user = auth.currentUser;
        if (!user) { setLoading(false); return; }
        setEmail(user.email || "");
        const refDoc = doc(db, "users", user.uid);
        const snap = await getDoc(refDoc);
        if (snap.exists()) {
          const d = snap.data();
          setOrgName(d.orgName || d.name || "");
          setContactName(d.contactName || "");
          setPhone(d.phone || "");
          setWebsite(d.socials?.website || d.website || "");
          setBio(d.bio || "");
          setGenresInterested(Array.isArray(d.genresInterested) ? d.genresInterested : (Array.isArray(d.genre) ? d.genre : []));
          setCities(Array.isArray(d.cities) ? d.cities : []);
          setVenues(Array.isArray(d.venues) ? d.venues.join(", ") : (d.venues || ""));
          if (d.logoUrl) setLogoUrl(d.logoUrl);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Auto-upload logo when selected
  useEffect(() => {
    const uploadLogo = async () => {
      if (!logoFile) return;
      try {
        const storage = getStorage();
        const fileRef = ref(storage, `profilePics/${auth.currentUser.uid}`);
        await uploadBytes(fileRef, logoFile);
        const url = await getDownloadURL(fileRef);
        setLogoUrl(url);
        await updateDoc(doc(db, "users", auth.currentUser.uid), { logoUrl: url });
      } catch (e) {
        console.error("Logo upload failed", e);
      }
    };
    uploadLogo();
  }, [logoFile]);

  // Require protocol in website URL
  const urlRegex = /^(https?:\/\/)([\w.-]+)\.[a-z]{2,}(\/\S*)?$/i;

  const handleSave = async () => {
    if (!auth.currentUser) return;
    // Basic validation
    if (!orgName.trim()) {
      alert("Organization/brand name is required");
      return;
    }
    if (!Array.isArray(cities) || cities.length === 0) {
      alert("At least one city is required");
      return;
    }
    if (website && !urlRegex.test(website)) {
      alert("Website URL must start with http:// or https:// and be valid");
      return;
    }
    if (phone && !/^[0-9()+\-\s]{7,}$/.test(phone)) {
      alert("Phone number looks invalid");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        role: "promoter",
        orgName,
        contactName,
        email,
        phone,
        website,
        bio,
        genresInterested,
        cities,
        venues: venues
          ? Array.from(new Set(venues.split(",").map(v => v.trim()).filter(Boolean)))
          : [],
        logoUrl,
        updatedAt: new Date(),
      };
      await setDoc(doc(db, "users", auth.currentUser.uid), payload, { merge: true });
      alert("Profile saved");
    } catch (e) {
      console.error("Failed saving promoter profile", e);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-white p-6">Loading…</div>;

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Promoter Profile</h1>
        <button onClick={handleSave} disabled={saving} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </div>

      <div className="bg-gray-800 p-4 rounded shadow space-y-6">
        {/* Logo Upload */}
        <div className="flex items-center gap-8 space-y-0">
          <div className="flex flex-col items-center">
            <span className="text-xs mb-2 text-gray-300 font-semibold">Current Profile Picture</span>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="w-20 h-20 rounded object-cover bg-white border-2 border-gray-400"
                style={{ width: 80, height: 80 }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded bg-gray-700 flex items-center justify-center text-gray-400 border-2 border-gray-400"
                style={{ width: 80, height: 80 }}
              >
                No Image
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-300 font-semibold mb-1">Upload New Profile Picture</span>
            <label className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded cursor-pointer inline-block flex items-center">
              Choose File
              <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="hidden" />
            </label>
          </div>
        </div>

        {/* Org + Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0">
          <div className="space-y-4">
            <label className="block mb-1 font-semibold text-sm">Organization / Brand Name</label>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-black"
              placeholder="Riddim Rapids"
            />
          </div>
          <div className="space-y-4">
            <label className="block mb-1 font-semibold text-sm">Primary Contact Name</label>
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-black"
              placeholder="Jane Doe"
            />
          </div>
          <div className="space-y-4 max-w-sm">
            <label className="block mb-1 font-semibold text-sm">Contact Email</label>
            <input
              value={email}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-black opacity-80 cursor-not-allowed"
            />
          </div>
          <div className="space-y-4 max-w-sm">
            <label className="block mb-1 font-semibold text-sm">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-black"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        {/* About */}
        <div className="space-y-4">
          <label className="block mb-1 font-semibold text-sm">About / Description</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-black"
            placeholder="We promote bass music events across the Midwest…"
          />
        </div>

        {/* Genres they book */}
        <div className="space-y-4">
          <label className="block mb-1 font-semibold text-sm">Genres You Book</label>
          <GenreSelector genres={genresInterested} setGenres={setGenresInterested} placeholder="Type a genre and press Enter" />
        </div>

        {/* Cities */}
        <div className="space-y-4">
          <label className="block mb-1 font-semibold text-sm">Cities You Operate In</label>
          <CitySelector cities={cities} setCities={setCities} />
        </div>

        {/* Venues */}
        <div className="space-y-4">
          <label className="block mb-1 font-semibold text-sm">Venues (comma separated)</label>
          <input
            value={venues}
            onChange={(e) => setVenues(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-black"
            placeholder="The Intersection, Skyway Theatre"
          />
        </div>

        {/* Budget Range */}
        <div className="grid grid-cols-2 gap-4 space-y-0 max-w-sm">
          <div className="space-y-4">
            <label className="block mb-1 font-semibold text-sm">Typical Budget Min ($)</label>
            <input
              type="number"
              min="0"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-black"
              placeholder="200"
            />
          </div>
          <div className="space-y-4">
            <label className="block mb-1 font-semibold text-sm">Typical Budget Max ($)</label>
            <input
              type="number"
              min="0"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-black"
              placeholder="3000"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4 max-w-sm">
          <label className="block mb-1 font-semibold text-sm">Website</label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="Website URL"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-black"
          />
        </div>

        {/* Footer Save */}
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}