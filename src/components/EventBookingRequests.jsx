import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function EventBookingRequests({ eventId, bookingRequests = [], setBookingRequests }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, "bookingRequests"),
          where("eventId", "==", eventId),
          where("promoterId", "==", auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const data = await Promise.all(
          querySnapshot.docs.map(async (bookingDoc) => {
            const requestData = bookingDoc.data();
            const djRef = doc(db, "users", requestData.djId);
            const djSnap = await getDoc(djRef);
            const userData = djSnap.exists() ? djSnap.data() : {};
            const name = userData.name || "Unknown DJ";
            const profilePicUrl = userData.profilePicUrl || null;
            return {
              id: bookingDoc.id,
              ...requestData,
              name,
              profilePicUrl,
            };
          })
        );
        if (setBookingRequests) setBookingRequests(data);
      } catch (err) {
        console.error("Error fetching booking requests:", err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchRequests();
    }
  }, [eventId, setBookingRequests]);

  if (loading) {
    return <p className="text-white mt-6">Loading booking requests...</p>;
  }

  const norm = (s) => (s || "pending").toString().toLowerCase();

  // Sort requests so Booked > Pending > Declined
  const sortedRequests = [...(bookingRequests || [])].sort((a, b) => {
    const order = { booked: 0, accepted: 0, pending: 1, declined: 2 };
    return (order[norm(a.status)] ?? 3) - (order[norm(b.status)] ?? 3);
  });

  const statusColor = (status) => {
    const s = norm(status);
    if (s === "booked" || s === "accepted") return "border-green-500 text-green-400";
    if (s === "pending") return "border-yellow-500 text-yellow-400";
    if (s === "declined") return "border-red-500 text-red-400";
    return "border-gray-500 text-gray-300";
  };

  return (
    <div>
      {sortedRequests.length === 0 ? (
        <p className="text-gray-400">No booking requests yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedRequests.map((req) => {
            const statusCls = statusColor(req.status);
            return (
              <div
                key={req.id}
                onClick={() => navigate(`/dj/${req.djId}`)}
                title="View DJ profile"
                className={`card card-hover border-l-4 ${statusCls.split(" ")[0]}`}
              >
                <div className="flex gap-4 items-center">
                  <div>
                    {req.profilePicUrl && (
                      <img
                        src={req.profilePicUrl}
                        alt={`${req.name}'s profile`}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <p><strong>DJ:</strong> {req.name}</p>
                    {req.message && (
                      <p className="mt-1"><strong>Message:</strong> {req.message}</p>
                    )}
                    <div className="mt-2">
                      <span className="text-xs uppercase tracking-wide text-gray-400 mr-2">Status</span>
                      <span className={`badge ${statusCls.split(" ")[1]}`}>
                        {(req.status || "Pending").toString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}