// src/pages/DJDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { format } from "date-fns";
import { ymdToLocalDate } from "../utils/date";
import DJCard from "../components/DJCard";

export default function DJDashboard() {
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState([]); // bookingRequests w/ status Pending
  const [upcoming, setUpcoming] = useState([]); // bookingRequests w/ status Booked/Accepted
  const [error, setError] = useState("");
  const [myProfile, setMyProfile] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const user = auth.currentUser;
      if (!user) {
        setError("Not signed in.");
        setLoading(false);
        return;
      }

      // Fetch my profile
      try {
        const meSnap = await getDoc(doc(db, "users", user.uid));
        if (meSnap.exists()) {
          setMyProfile({ id: user.uid, ...meSnap.data() });
        } else {
          setMyProfile(null);
        }
      } catch (e) {
        console.error("Error fetching my profile", e);
      }

      // 1) Get all booking requests for this DJ
      const brSnap = await getDocs(
        query(collection(db, "bookingRequests"), where("djId", "==", user.uid))
      );

      const requests = brSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // 2) Fetch associated event docs and promoter docs
      const withEvents = await Promise.all(
        requests.map(async (r) => {
          let event = null;
          let promoter = null;
          try {
            const evSnap = await getDoc(doc(db, "events", r.eventId));
            event = evSnap.exists() ? { id: evSnap.id, ...evSnap.data() } : null;
          } catch (e) {
            console.error("Error fetching event", r.eventId, e);
          }
          try {
            if (r.promoterId) {
              const proSnap = await getDoc(doc(db, "users", r.promoterId));
              promoter = proSnap.exists() ? { id: proSnap.id, ...proSnap.data() } : null;
            }
          } catch (e) {
            console.error("Error fetching promoter", r.promoterId, e);
          }
          return { ...r, event, promoter };
        })
      );

      // 3) Split & sort
      const p = withEvents
        .filter((r) => (r.status || "Pending").toLowerCase() === "pending")
        .sort((a, b) => new Date(a.event?.date || 0) - new Date(b.event?.date || 0));

      const u = withEvents
        .filter((r) => {
          const s = (r.status || "").toLowerCase();
          return s === "booked" || s === "accepted";
        })
        .sort((a, b) => new Date(a.event?.date || 0) - new Date(b.event?.date || 0));

      setPending(p);
      setUpcoming(u);
    } catch (e) {
      console.error(e);
      setError("Failed to load booking requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRespond = async (requestId, nextStatus, eventDate) => {
    try {
      // 1) Update booking request status
      await updateDoc(doc(db, "bookingRequests", requestId), { status: nextStatus });

      // 2) If accepted/booked, mark that date unavailable in the DJ's availabilityOverrides
      if ((nextStatus === "Booked" || nextStatus === "Accepted") && eventDate) {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const snap = await getDoc(userRef);
          const data = snap.exists() ? snap.data() : {};
          const overrides = { ...(data.availabilityOverrides || {}) };
          // Ensure we store the exact date string key (YYYY-MM-DD)
          overrides[eventDate] = false;
          await updateDoc(userRef, { availabilityOverrides: overrides });
        }
      }

      await loadData();
    } catch (e) {
      console.error("Failed to update request status", e);
      alert("Could not update request. Check Firestore rules to allow DJ updates to bookingRequests.");
    }
  };

  const RequestCard = ({ r, showActions = false }) => {
    const event = r.event;
    const dateStr = event?.date ? format(ymdToLocalDate(event.date), "M/d/yyyy") : "TBD";
    return (
      <div className="bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-700 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{event?.name || "Untitled Event"}</h3>
          <span
            className={
              ((r.status || "Pending").toLowerCase() === "pending"
                ? "text-yellow-400"
                : (r.status || "").toLowerCase() === "declined"
                ? "text-red-400"
                : "text-green-400"
              ) + " font-semibold"
            }
          >
            {(r.status || "Pending").toUpperCase()}
          </span>
        </div>
        <div className="text-sm text-gray-400">
          {dateStr}
          {event?.city ? ` • ${event.city}` : ""}
          {event?.venue ? ` • ${event.venue}` : ""}
        </div>
        {r.promoter && (
          <div className="mt-2 flex items-center gap-3">
            {r.promoter.logoUrl && (
              <img
                src={r.promoter.logoUrl}
                alt="Promoter logo"
                className="w-10 h-10 rounded-full object-cover border border-gray-300 bg-white"
              />
            )}
            <div className="text-sm text-gray-300 leading-tight">
              From: <span className="font-medium">{r.promoter.orgName || r.promoter.name || "Promoter"}</span>
              {r.promoter.email && (
                <>
                  {" • "}
                  <a href={`mailto:${r.promoter.email}`} className="underline hover:text-gray-200">{r.promoter.email}</a>
                </>
              )}
              {r.promoter.website && (() => {
                let websiteUrl = r.promoter.website;
                if (!websiteUrl.startsWith("http://") && !websiteUrl.startsWith("https://")) {
                  websiteUrl = `https://${websiteUrl}`;
                }
                return (
                  <>
                    {" • "}
                    <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-200">
                      {r.promoter.website}
                    </a>
                  </>
                );
              })()}
            </div>
          </div>
        )}
        {r.message && (
          <div className="text-sm text-gray-400 mt-1">Message: {r.message}</div>
        )}
        {showActions && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => handleRespond(r.id, "Booked", r.event?.date)}
              className="px-3 py-1 rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Accept
            </button>
            <button
              onClick={() => handleRespond(r.id, "Declined")}
              className="px-3 py-1 rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Decline
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <p className="text-white p-6">Loading your bookings…</p>;
  if (error) return <p className="text-red-400 p-6">{error}</p>;

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: bookings */}
        <div className="space-y-8">
          {pending.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-3">Booking Requests</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {pending.map((r) => (
                  <RequestCard key={r.id} r={r} showActions />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-2xl font-semibold mb-3">Upcoming Events</h2>
            {upcoming.length === 0 ? (
              <p className="text-gray-400">No confirmed bookings yet.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {upcoming.map((r) => (
                  <RequestCard key={r.id} r={r} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right: my DJ card */}
        <aside className="space-y-4 lg:pl-6">
          <h2 className="text-2xl font-semibold">Your Profile</h2>
          {myProfile ? (
            <>
              <DJCard dj={myProfile} onBook={null} />
              <p className="text-sm text-gray-400">
                *Promoters will see your profile just like this.
              </p>
            </>
          ) : (
            <p className="text-gray-400">No profile found yet. Head to Edit Profile to complete your DJ info.</p>
          )}
        </aside>
      </div>

      {/* NOTE: To allow Accept/Decline from the client, ensure your Firestore rules include: */}
      {/* match /bookingRequests/{requestId} { */}
      {/*   allow update: if request.auth != null && request.auth.uid == resource.data.djId; */}
      {/* } */}
    </div>
  );
}