import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const run = async () => {
      const snap = await getDocs(query(collection(db, "supportTickets"), orderBy("createdAt","desc")));
      setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    run();
  }, []);

  const setStatus = async (id, status) => {
    await updateDoc(doc(db, "supportTickets", id), { status });
    setTickets(ts => ts.map(t => t.id === id ? { ...t, status } : t));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Support Tickets</h1>
      <div className="space-y-3">
        {tickets.map(t => (
          <div key={t.id} className="bg-gray-800 p-4 rounded border border-gray-700">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{t.title}</div>
                <div className="text-sm text-gray-300">{t.category} • {t.severity}</div>
                <div className="text-xs text-gray-400 mt-1">{t.pageUrl}</div>
              </div>
              <select
                value={t.status}
                onChange={(e) => setStatus(t.id, e.target.value)}
                className="bg-white text-black rounded px-2 py-1"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <p className="mt-2 text-gray-200">{t.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}