import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import EventCreate from "./EventCreate";
import DJSearch from "./DJSearch";
import EventBookingRequests from "./EventBookingRequests";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { ymdToLocalDate } from "../utils/date";

export default function EventDetail() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [bookingRequests, setBookingRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      const docRef = doc(db, "events", eventId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEvent(docSnap.data());
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleEventUpdated = (updatedEvent) => {
    setEvent(updatedEvent);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this event?");
    if (!confirmDelete) return;

    try {
      // Debug Firestore rule: log current user ID and event promoterId
      console.log("auth.currentUser?.uid:", auth.currentUser?.uid, "event.promoterId:", event.promoterId);
      // Delete all booking requests associated with this event
      const bookingRequestsRef = collection(db, "bookingRequests");
      const q = query(bookingRequestsRef, where("eventId", "==", eventId));
      const querySnapshot = await getDocs(q);
      for (const docSnap of querySnapshot.docs) {
        await deleteDoc(doc(db, "bookingRequests", docSnap.id));
      }
      await deleteDoc(doc(db, "events", eventId));
      navigate("/dashboard");
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  if (!event) return <p className="text-white p-6">Loading event details...</p>;

  return (
    <div className="min-h-screen bg-bg text-white p-6">
      <button onClick={() => navigate("/dashboard")} className="text-purple-400 hover:underline mb-4 inline-block">← Back to Events</button>
      <div className="card mb-6">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold">{event.name}</h1>
          <span className="badge">{format(ymdToLocalDate(event.date), "M/d/yyyy")}</span>
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-200">
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-400">Venue</div>
            <div className="mt-1">{event.venue || "TBD"}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-400">City</div>
            <div className="mt-1">{event.city || "TBD"}</div>
          </div>
          <div className="sm:col-span-3">
            <div className="text-xs uppercase tracking-wider text-gray-400">Description</div>
            <div className="mt-1">{event.description || "—"}</div>
          </div>
        </div>
        {event.promoterId === auth.currentUser?.uid && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => setIsEditing(true)} className="btn">Edit Event Details</button>
          </div>
        )}
      </div>
      {isEditing && (
        <div className="mb-8">
          <EventCreate
            eventId={eventId}
            edit={true}
            existingEvent={event}
            onCancel={() => setIsEditing(false)}
            onUpdated={handleEventUpdated}
          />
        </div>
      )}
      <div className="card space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">Booking Requests</h2>
          <EventBookingRequests
            eventId={eventId}
            bookingRequests={bookingRequests}
            setBookingRequests={setBookingRequests}
          />
        </div>
        <div>
          <DJSearch event={event} bookingRequests={bookingRequests} setBookingRequests={setBookingRequests} />
        </div>
        {event.promoterId === auth.currentUser?.uid && (
          <div className="pt-2 flex justify-end">
            <button onClick={handleDelete} className="btn-danger">Delete Event</button>
          </div>
        )}
      </div>
    </div>
  );
}