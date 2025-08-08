import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { auth, db } from './firebase';
import { getDoc, doc } from 'firebase/firestore';

import DJDashboard from './pages/DJDashboard';
import PromoterDashboard from './pages/PromoterDashboard';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EventDetail from './components/EventDetail';
import ProfileEdit from './pages/ProfileEdit';
import DJProfile from './pages/DJProfile';
import PendingReview from './pages/PendingReview';
import ContactSupport from './pages/ContactSupport';
import AdminSupport from './pages/AdminSupport';

function AppContent() {
  const [user, setUser] = useState(undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const [role, setRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [emailVerified, setEmailVerified] = useState(null);
  const emailSentRef = useRef(false);

  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try { await u.reload(); } catch (e) {}
        setEmailVerified(!!u.emailVerified);
        if (!u.emailVerified && !emailSentRef.current) {
          try {
            await sendEmailVerification(u, { url: `${window.location.origin}/login`, handleCodeInApp: true });
            emailSentRef.current = true;
          } catch (e) {
            console.error('Failed to send verification email automatically:', e);
          }
        }
        const userDocRef = doc(db, 'users', u.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setRole(data.role || null);
          setUserStatus(data.status || null);
          setIsAdmin(!!data.isAdmin);
        } else {
          setRole(null);
          setUserStatus(null);
          setIsAdmin(false);
        }
      } else {
        setEmailVerified(null);
        setRole(null);
        setUserStatus(null);
        setIsAdmin(false);
        emailSentRef.current = false;
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".menu-container")) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen]);

  if (user === undefined) return <p className="text-white p-6">Loading...</p>;

  return (
    <div>
      <nav className="bg-gray-800 text-white p-3 flex justify-between items-center">
        <Link to={user ? "/dashboard" : "/"} className="text-lg font-bold">
          <img src={require('./images/bookington-logo.png')} alt="Bookington Logo" className="h-10" />
        </Link>
        {user ? (
          <div className="relative menu-container">
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-white text-xl">
              ☰
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-gray-700 rounded shadow-lg z-50">
                {location.pathname !== "/dashboard" && (
                  <Link to="/dashboard" className="block px-4 py-2 hover:bg-gray-600">Dashboard</Link>
                )}
                {location.pathname !== "/edit-profile" && emailVerified !== false && (
                  <Link to="/edit-profile" className="block px-4 py-2 hover:bg-gray-600">Edit Profile</Link>
                )}
                {location.pathname !== "/support" && (
                  <Link to="/support" className="block px-4 py-2 hover:bg-gray-600">Support</Link>
                )}
                {isAdmin && location.pathname !== "/admin/support" && (
                  <Link to="/admin/support" className="block px-4 py-2 hover:bg-gray-600">Admin • Support</Link>
                )}
                <button
                  onClick={() => {
                    auth.signOut();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-700 text-red-400"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          location.pathname !== "/login" && (
            <Link to="/login" className="hover:underline">Login</Link>
          )
        )}
      </nav>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={user ? <VerifyNotice user={user} /> : <Navigate to="/login" />} />
        <Route
          path="/dashboard"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : emailVerified === false ? (
              <Navigate to="/verify" />
            ) : role === "promoter" ? (
              <PromoterDashboard />
            ) : (
              <DJDashboard />
            )
          }
        />
        <Route
          path="/event/:eventId"
          element={user ? <EventDetail /> : <Navigate to="/login" />}
        />
        <Route
          path="/edit-profile"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : emailVerified === false ? (
              <Navigate to="/verify" />
            ) : (
              <ProfileEdit />
            )
          }
        />
        <Route
          path="/dj/:djId"
          element={user ? <DJProfile /> : <Navigate to="/login" />}
        />
        <Route path="/support" element={user ? <ContactSupport /> : <Navigate to="/login" />} />
        <Route path="/admin/support" element={
            !user ? <Navigate to="/login" /> : (isAdmin ? <AdminSupport /> : <Navigate to="/dashboard" />)
          } />
      </Routes>
    </div>
  );
}

function VerifyNotice({ user }) {
  if (!user) return null;
  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-2">Verify your email</h1>
      <p className="text-gray-300 mb-6">We sent a verification link to <strong>{user.email}</strong>. Click it, log in, then close this tab.</p>
      <div className="flex gap-3">
        <button
          onClick={async () => {
            try {
              await sendEmailVerification(user, { url: `${window.location.origin}/login`, handleCodeInApp: true });
              alert('Verification email sent.');
            } catch (e) {
              console.error(e);
              alert('Could not send email');
            }
          }}
          className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
        >Resend link</button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
