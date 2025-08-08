import React, { useEffect, useState } from "react";
import DJProfileEdit from "../pages/DJProfileEdit";
import PromoterProfileEdit from "../pages/PromoterProfileEdit";
import { db, auth } from "../firebase";
import { getDoc, doc } from "firebase/firestore";

const ProfileEdit = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      } catch (e) {
        console.error("Failed to load role:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, []);

  if (loading) return <div className="text-white p-6">Loading...</div>;
  if (!auth.currentUser) return <div className="text-white p-6">Not signed in.</div>;
  if (!role) return <div className="text-white p-6">Loading...</div>;

  return role === "promoter" ? <PromoterProfileEdit /> : <DJProfileEdit />;
};

export default ProfileEdit;