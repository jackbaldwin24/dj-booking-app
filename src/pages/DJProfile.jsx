

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { db, storage } from "../firebase";
import DJCard from "../components/DJCard";

export default function DJProfile() {
  const { djId } = useParams();
  const [dj, setDj] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDJ = async () => {
      try {
        const snap = await getDoc(doc(db, "users", djId));
        if (!snap.exists()) {
          setDj(null);
          return;
        }
        const data = { id: djId, ...snap.data() };
        // Try to pull profile pic from Storage if not already on the doc
        if (!data.profilePicUrl) {
          try {
            const url = await getDownloadURL(ref(storage, `profilePics/${djId}`));
            data.profilePicUrl = url;
          } catch (_) {
            // ignore if not found
          }
        }
        setDj(data);
      } finally {
        setLoading(false);
      }
    };
    if (djId) fetchDJ();
  }, [djId]);

  if (loading) return <div className="p-6 text-white">Loading…</div>;
  if (!dj) return <div className="p-6 text-white">DJ not found.</div>;

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <DJCard dj={dj} onBook={null} />
    </div>
  );
}