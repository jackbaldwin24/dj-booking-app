import { useState, useRef } from "react";
import { FcGoogle } from "react-icons/fc";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase";
import { setDoc, getDoc, doc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const passwordRef = useRef(null);
  const navigate = useNavigate();

  const getPasswordError = (password) => {
    if (password.length < 8) return "At least 8 characters required.";
    if (!/[A-Z]/.test(password)) return "Include at least one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Include at least one lowercase letter.";
    if (!/\d/.test(password)) return "Include at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Include at least one special character.";
    return ""; // no error
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const err = getPasswordError(password);
    if (err) {
      if (passwordRef.current) {
        passwordRef.current.setCustomValidity(err);
        passwordRef.current.reportValidity();
      }
      return;
    } else if (passwordRef.current) {
      passwordRef.current.setCustomValidity("");
    }
    try {
      setSubmitting(true);
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const user = userCred.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role,
        createdAt: new Date(),
        // promoter review fields
        promoterStatus: role === "promoter" ? "pending" : "approved",
        promoterAppliedAt: role === "promoter" ? new Date() : null
      });

      if (role === "promoter") {
        navigate("/pending-review");
      } else {
        navigate("/edit-profile");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      // Decide promoter status from current role selection
      const promoterStatus = role === "promoter" ? "pending" : "approved";

      await setDoc(
        userRef,
        {
          email: user.email,
          role, // honor the selected role in the form
          createdAt: snap.exists() ? (snap.data().createdAt || new Date()) : new Date(),
          promoterStatus,
          promoterAppliedAt: role === "promoter" ? new Date() : null,
        },
        { merge: true }
      );

      if (role === "promoter") {
        navigate("/pending-review");
      } else {
        navigate("/edit-profile");
      }
    } catch (error) {
      console.error("Google signup failed", error);
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-6">Create your Bookington account</h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-1">Account type <span className="text-red-400">*</span></label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-black"
            >
              <option value="" disabled>Select account type…</option>
              <option value="dj">DJ</option>
              <option value="promoter">Promoter</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={submitting || !role}
            className={`w-full py-2 rounded-md border border-gray-600 bg-white text-black hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2`}
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </button>
          {!role && (
            <p className="text-xs text-gray-300 mt-1">Select an account type first to continue with Google.</p>
          )}

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-gray-800 text-gray-300 text-sm">or use email</span>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-black"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input
              id="password"
              type="password"
              placeholder="At least 8 characters, including uppercase, lowercase, number, and special character"
              value={password}
              onChange={(e) => {
                const val = e.target.value;
                setPassword(val);
                const err = getPasswordError(val);
                if (passwordRef.current) {
                  passwordRef.current.setCustomValidity(err);
                  // Only trigger reportValidity if field is non-empty to avoid flashing
                  if (val.length > 0) passwordRef.current.reportValidity();
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-black"
              required
              minLength={8}
              pattern={'^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$'}
              title="Password must be at least 8 characters, include one uppercase letter, one lowercase letter, one number, and one special character."
              autoComplete="new-password"
              ref={passwordRef}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !role}
            className="w-full py-2 rounded-md bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Creating account…" : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-300">Already have an account? </span>
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
