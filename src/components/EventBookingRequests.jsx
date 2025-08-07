import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function EventBookingRequests({ eventId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const q = query(
          collection(db, "bookingRequests"),
          where("eventId", "==", eventId),
          where("promoterId", "==", auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const data = await Promise.all(querySnapshot.docs.map(async (bookingDoc) => {
          const requestData = bookingDoc.data();
          const djRef = doc(db, "users", requestData.djId);
          const djSnap = await getDoc(djRef);
          const name = djSnap.exists() ? djSnap.data().name : "Unknown DJ";
          return {
            id: bookingDoc.id,
            ...requestData,
            name
          };
        }));
        setRequests(data);
      } catch (err) {
        console.error("Error fetching booking requests:", err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchRequests();
    }
  }, [eventId]);

  if (loading) {
    return <p className="text-white mt-6">Loading booking requests...</p>;
  }

  // Sort requests so Booked > Pending > Declined
  const sortedRequests = [...requests].sort((a, b) => {
    const statusOrder = { Booked: 0, Pending: 1, Declined: 2 };
    return (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
  });

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold text-white mb-4">
        Booking Requests
      </h2>
      {requests.length === 0 ? (
        <p className="text-gray-400">No booking requests yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedRequests.map((req) => {
            const statusColors = {
              Booked: "border-green-500",
              Pending: "border-yellow-500",
              Declined: "border-red-500",
            };
            return (
              <div
                key={req.id}
                className={`border-l-4 ${statusColors[req.status] || "border-gray-500"} bg-gray-800 p-4 rounded text-white shadow`}
              >
                <p><strong>DJ:</strong> {req.name}</p>
                {req.message && (
                  <p className="mt-1"><strong>Message:</strong> {req.message}</p>
                )}
                <p className="mt-2">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      req.status === "Booked"
                        ? "text-green-400"
                        : req.status === "Pending"
                        ? "text-yellow-400"
                        : req.status === "Declined"
                        ? "text-red-400"
                        : "text-gray-300"
                    }`}
                  >
                    {req.status || "Pending"}
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}