import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import EventCreate from "../components/EventCreate";

export default function PromoterDashboard() {
  const [events, setEvents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      if (!auth.currentUser) return;

      try {
        const q = query(
          collection(db, "events"),
          where("promoterId", "==", auth.currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const eventData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEvents(eventData);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Your Events</h1>
      <button
        onClick={() => setShowCreateModal(true)}
        className="mb-4 bg-green-600 px-4 py-2 rounded hover:bg-green-700"
      >
        Create Event
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map(event => (
          <div
            key={event.id}
            className="bg-gray-800 p-4 rounded shadow space-y-2"
          >
            <h2 className="text-xl font-semibold">{event.name}</h2>
            <p><strong>Date:</strong> {event.date}</p>
            <p><strong>City:</strong> {event.city}</p>
            <button
              onClick={() => navigate(`/event/${event.id}`)}
              className="mt-2 bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
            >
              View
            </button>
          </div>
        ))}
      </div>
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white text-black p-4 rounded max-w-lg w-full">
            <EventCreate onCancel={() => setShowCreateModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}