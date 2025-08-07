import React, { useEffect, useState } from "react";
import EventCreate from "./EventCreate";
import DJSearch from "./DJSearch";
import EventBookingRequests from "./EventBookingRequests";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function EventDetail() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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

  if (!event) return <p className="text-white p-6">Loading event details...</p>;

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">{event.name}</h1>
      <p><strong>Date:</strong> {event.date}</p>
      <p><strong>Venue:</strong> {event.venue}</p>
      <p><strong>City:</strong> {event.city}</p>
      <p><strong>Description:</strong> {event.description}</p>

      {event.promoterId === auth.currentUser?.uid && (
        <>
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            Edit Event Details
          </button>
          {isEditing && (
            <div className="mt-6">
              <EventCreate
                eventId={eventId}
                edit={true}
                existingEvent={event}
                onCancel={() => setIsEditing(false)}
                onUpdated={handleEventUpdated}
              />
            </div>
          )}
        </>
      )}
      <div className="mt-10">
        <div className="mt-10">
          <EventBookingRequests eventId={eventId} />
        </div>
        <DJSearch event={event} />
      </div>
    </div>
  );
}