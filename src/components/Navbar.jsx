// frontend/src/components/Navbar.jsx
"use client";

import axios from "axios";
import { useRouter } from "next/navigation";

export default function Navbar({ user }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/users/logout", {}, {
        withCredentials: true 
      });
      localStorage.removeItem("user");
      router.push("/login");
    } catch (error) {
      console.error("লগআউট ব্যর্থ হয়েছে:", error);
      alert("লগআউট করতে সমস্যা হয়েছে।");
    }
  };

  // 🧠 Developer Mindset: যদি ইউজার ডেটা না থাকে, তবে ন্যাভবার ক্র্যাশ না করে 
  // শুধু একটি ফাঁকা বা ডামি হেডার দেখাবে, যাতে পেজ লোডিং লুপে না পড়ে।
  return (
    <div className="navbar bg-primary text-primary-content shadow-lg px-4 md:px-8 h-16">
      <div className="flex-1">
        <span className="text-xl font-bold tracking-wide">
          Community App
        </span>
      </div>

      {user && (
        <div className="flex-none gap-4 items-center">
          <div className="hidden sm:block text-sm font-medium">
            {user.name}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-sm btn-error text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-all"
          >
            লগআউট
          </button>
        </div>
      )}
    </div>
  );
}