"use client";

import { useRouter } from "next/navigation";

const Logout = ({ onClose }) => {
  const router = useRouter();

  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("name");

    router.push("/");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-[90%] max-w-md text-center animate-[goDown_0.5s_ease_forwards]">
        <h2 className="text-xl font-bold text-[#111144] mb-4">
          هل أنت متأكد أنك تريد تسجيل الخروج؟
        </h2>
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handleConfirmLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg transition-transform transform active:scale-90 cursor-pointer"
          >
            نعم، تسجيل الخروج
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold px-5 py-2 rounded-lg transition-transform transform active:scale-90 cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logout;
