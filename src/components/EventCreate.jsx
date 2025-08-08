import React, { useEffect, useState } from "react";
import CitySelector from "./CitySelector";
import { addDoc, collection, Timestamp, doc, updateDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function EventCreate({ eventId, existingEvent = null, edit = false, onSubmit, onCancel, onUpdated }) {
  const [form, setForm] = useState({
    name: "",
    date: "",
    venue: "",
    city: "",
    description: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (edit && existingEvent) {
      setForm({
        name: existingEvent.name || "",
        date: existingEvent.date || "",
        venue: existingEvent.venue || "",
        city: existingEvent.city || "",
        description: existingEvent.description || "",
      });
    }
  }, [edit, existingEvent]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (edit && eventId) {
        const eventRef = doc(db, "events", eventId);
        await updateDoc(eventRef, {
          ...form,
          updatedAt: Timestamp.now(),
        });

        // Fetch updated data and call onSubmit with fresh values
        const updatedSnap = await getDoc(eventRef);
        const updatedData = updatedSnap.data();

        if (onSubmit) onSubmit(eventId, updatedData);
        if (onUpdated) onUpdated(updatedData);
        navigate(`/event/${eventId}`);
        if (onCancel) onCancel();
      } else {
        const newEvent = {
          ...form,
          promoterId: auth.currentUser.uid,
          timestamp: Timestamp.now(),
        };
        const docRef = await addDoc(collection(db, "events"), newEvent);
        if (onSubmit) onSubmit(docRef.id, newEvent);
        navigate(`/event/${docRef.id}`);
        setForm({ name: "", date: "", venue: "", city: "", description: "" });
      }
    } catch (err) {
      console.error("Error saving event:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/70 backdrop-blur p-6 rounded-xl shadow-lg border border-white/10 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">{edit ? "Edit Event" : "Create New Event"}</h2>
      </div>
      <label className="block">
        <span className="block text-sm text-gray-300 mb-1">Event Name</span>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g., Riddim Rapids — Summer Session"
          required
          className="w-full p-2.5 rounded-lg bg-white/90 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-sm text-gray-300 mb-1">Date</span>
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={edit ? undefined : handleChange}
            readOnly={edit}
            required
            className="w-full p-2.5 rounded-lg bg-white/90 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </label>
        <label className="block">
          <span className="block text-sm text-gray-300 mb-1">Venue</span>
          <input
            name="venue"
            value={form.venue}
            onChange={handleChange}
            placeholder="e.g., The Intersection"
            className="w-full p-2.5 rounded-lg bg-white/90 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </label>
      </div>
      <div>
        <span className="block text-sm text-gray-300 mb-1">City</span>
        <CitySelector
          cities={form.city ? [form.city] : []}
          setCities={(cities) => setForm({ ...form, city: cities[0] || "" })}
          singleSelect={true}
        />
        <p className="mt-1 text-xs text-gray-400">Select the city where the event is held.</p>
      </div>
      <label className="block">
        <span className="block text-sm text-gray-300 mb-1">Event Description</span>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Optional details: lineup notes, load-in, set length, etc."
          rows={4}
          className="w-full p-3 rounded-lg bg-white/90 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </label>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
        <button
          type="submit"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {edit ? "Save Changes" : "Create Event"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={() => onCancel()}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium bg-white/10 text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}