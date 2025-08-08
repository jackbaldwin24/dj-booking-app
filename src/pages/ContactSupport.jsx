import React, { useState, useEffect, useMemo } from "react";
import { addDoc, collection, Timestamp, getDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase";

const CaretDown = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.207l3.71-2.977a.75.75 0 111.04 1.08l-4.24 3.4a.75.75 0 01-.94 0l-4.24-3.4a.75.75 0 01-.02-1.1z" clipRule="evenodd" />
  </svg>
);

function SelectField({ value, onChange, children, label }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full px-3 pr-10 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><CaretDown /></span>
      </div>
    </div>
  );
}

export default function ContactSupport() {
  const [category, setCategory] = useState("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("normal");
  const [pageUrl, setPageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => setPageUrl(window.location.href), []);

  const envInfo = useMemo(() => ({
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
  }), []);

  // Wait for Firestore to propagate the ticket before uploading attachments
  const waitForTicket = async (id, attempts = 5, delayMs = 250) => {
    for (let i = 0; i < attempts; i++) {
      try {
        const snap = await getDoc(doc(db, "supportTickets", id));
        if (snap.exists()) return true;
      } catch (e) {
        // ignore and retry
      }
      await new Promise(r => setTimeout(r, delayMs));
    }
    return false;
  };

  const validate = () => {
    if (!title.trim()) return "Please add a short title.";
    if (!description.trim()) return "Please describe the issue or request.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const v = validate();
    if (v) return setError(v);
    if (!auth.currentUser) return setError("You must be logged in.");

    try {
      setSubmitting(true);
      // 1) create base ticket
      const ticket = {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || "",
        category, // 'bug' | 'feature' | 'other'
        title: title.trim(),
        description: description.trim(),
        severity, // 'low' | 'normal' | 'high'
        pageUrl,
        envInfo, // helpful diagnostics
        status: "open",
        createdAt: Timestamp.now(),
        comments: [],
      };
      const docRef = await addDoc(collection(db, "supportTickets"), ticket);
      await waitForTicket(docRef.id);

      setSuccess("Thanks! Your ticket was submitted.");
      setCategory("bug");
      setTitle("");
      setDescription("");
      setSeverity("normal");
    } catch (err) {
      console.error(err);
      setError("Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const titleLimit = 120;
  const titleCount = title.length;
  const descMin = 10;

  return (
    <div className="min-h-screen w-full bg-gray-900">
      <div className="max-w-3xl mx-auto p-6 text-white">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Support</h1>
          <p className="text-gray-300 mt-2">Found a bug or want a feature? This form goes straight to the dev queue.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-5 rounded-md border border-gray-700">
          {error && <div className="bg-red-900/50 border border-red-500 text-red-200 rounded p-2">{error}</div>}
          {success && <div className="bg-green-900/40 border border-green-600 text-green-200 rounded p-2">{success}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <SelectField label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="bug">Bug</option>
                <option value="feature">Feature Request</option>
                <option value="other">Other</option>
              </SelectField>
            </div>
            <div className="md:col-span-1">
              <div>
                <SelectField label="Severity" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </SelectField>
                <p className="text-xs text-gray-400 mt-1">High = blocks you, Normal = annoying, Low = polish/idea.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary"
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={titleLimit}
              required
            />
            <div className="text-xs text-gray-400 mt-1 text-right">{titleCount}/{titleLimit}</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened, steps to reproduce, or what feature you want..."
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={6}
              minLength={descMin}
              required
            />
            <p className="text-xs text-gray-400 mt-1">Please include steps to reproduce if it’s a bug.</p>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Page: {pageUrl}</span>
            <span>Browser: {envInfo.userAgent}</span>
          </div>

          <div className="flex items-center justify-between">
            <a href="/" className="text-sm text-gray-300 hover:text-white">← Back</a>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}