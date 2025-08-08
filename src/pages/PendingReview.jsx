

import React from "react";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function PendingReview() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (e) {
      console.error("Sign out failed", e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-xl max-w-lg w-full text-center space-y-5 shadow">
        <h1 className="text-2xl font-bold">Account under review</h1>
        <p className="text-gray-200">
          Thanks for signing up as a promoter. Your account is currently pending approval.
          You’ll get access to promoter features once approved.
        </p>
        <div className="space-y-3">
          <Link
            to="/edit-profile"
            className="inline-block px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700"
          >
            Edit Profile
          </Link>
          <div>
            <button
              onClick={handleSignOut}
              className="inline-block px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}