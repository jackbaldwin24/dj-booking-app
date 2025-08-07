import React, { useEffect, useState } from "react";
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
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded space-y-4">
      <h2 className="text-xl font-bold text-white">
        {edit ? "Editing Event" : "Create New Event"}
      </h2>
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Event Name"
        required
        className="w-full p-2 rounded text-black"
      />
      <input
        name="date"
        type="date"
        value={form.date}
        onChange={handleChange}
        required
        className="w-full p-2 rounded text-black"
      />
      <input
        name="venue"
        value={form.venue}
        onChange={handleChange}
        placeholder="Venue"
        className="w-full p-2 rounded text-black"
      />
      <input
        name="city"
        value={form.city}
        onChange={handleChange}
        placeholder="City"
        className="w-full p-2 rounded text-black"
      />
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Event Description"
        className="w-full p-2 rounded text-black"
      />
      <div className="flex space-x-2">
        <button type="submit" className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700">
          {edit ? "Save Changes" : "Create Event"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={() => onCancel()}
            className="bg-gray-600 px-4 py-2 rounded text-white hover:bg-gray-700"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}