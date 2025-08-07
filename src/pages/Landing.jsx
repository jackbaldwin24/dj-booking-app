import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function Landing() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black to-gray-800 text-white text-4xl space-y-6">
      <div>Welcome to DJ Booking App 🎧</div>
      <button
        onClick={() => signOut(auth)}
        className="text-base bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
      >
        Log Out
      </button>
    </div>
  );
}

export default Landing;
