import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("dj");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCred.user;

      await setDoc(doc(db, "users", user.uid), {
        email,
        role,
      });

      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form
      onSubmit={handleSignup}
      className="max-w-md mx-auto mt-10 space-y-4 text-white"
    >
      <h1 className="text-3xl font-bold mb-4">Sign Up</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 bg-gray-700 rounded"
        required
      />
      <input
        type="password"
        placeholder="Password (6+ characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 bg-gray-700 rounded"
        required
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full p-2 bg-gray-700 text-white rounded"
      >
        <option value="dj">DJ</option>
        <option value="promoter">Promoter</option>
      </select>
      <button
        type="submit"
        className="w-full p-2 bg-green-600 hover:bg-green-700 rounded"
      >
        Create Account
      </button>
    </form>
  );
}

export default Signup;
