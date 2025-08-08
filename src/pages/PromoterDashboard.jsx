import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import EventCreate from "../components/EventCreate";
import { format } from "date-fns";
import { ymdToLocalDate } from "../utils/date";

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
        setEvents(
          eventData.sort((a, b) => new Date(a.date) - new Date(b.date))
        );
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-bg text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Your Events</h1>
      <button
        onClick={() => setShowCreateModal(true)}
        className="btn mb-4"
      >
        + Create Event
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map(event => (
          <div
            key={event.id}
            onClick={() => navigate(`/event/${event.id}`)}
            className="card card-hover space-y-2"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">{event.name}</h2>
              <span className="badge">{format(ymdToLocalDate(event.date), "M/d/yyyy")}</span>
            </div>
            <div className="text-gray-300">{event.city}</div>
          </div>
        ))}
      </div>
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-card text-white p-4 rounded-xl max-w-lg w-full shadow-card">            <EventCreate onCancel={() => setShowCreateModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}