import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { getDoc, doc } from "firebase/firestore";
import DJDashboard from "./DJDashboard";
import PromoterDashboard from "./PromoterDashboard";

function Dashboard() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setRole(data.role);
      }
    };

    fetchRole();
  }, []);

  if (!role) return <p className="text-white p-6">Loading dashboard...</p>;

  return role === "promoter" ? <PromoterDashboard /> : <DJDashboard />;
}

export default Dashboard;
