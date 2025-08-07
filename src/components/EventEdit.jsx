

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function EventEdit() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    name: "",
    date: "",
    venue: "",
    city: "",
    description: "",
  });

  useEffect(() => {
    const fetchEvent = async () => {
      const docRef = doc(db, "events", eventId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEventData(docSnap.data());
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "events", eventId);
      await updateDoc(docRef, {
        ...eventData,
        updatedAt: new Date(),
      });
      alert("Event updated!");
      navigate(`/event/${eventId}`);
    } catch (err) {
      console.error("Error updating event:", err);
    }
  };

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen space-y-4">
      <h1 className="text-2xl font-bold">Edit Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <input name="name" value={eventData.name} onChange={handleChange} placeholder="Event Name" className="w-full p-2 rounded text-black" required />
        <input name="date" type="date" value={eventData.date} onChange={handleChange} className="w-full p-2 rounded text-black" required />
        <input name="venue" value={eventData.venue} onChange={handleChange} placeholder="Venue" className="w-full p-2 rounded text-black" />
        <input name="city" value={eventData.city} onChange={handleChange} placeholder="City" className="w-full p-2 rounded text-black" />
        <textarea name="description" value={eventData.description} onChange={handleChange} placeholder="Description" className="w-full p-2 rounded text-black" rows={4} />
        <button type="submit" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">Update Event</button>
      </form>
    </div>
  );
}