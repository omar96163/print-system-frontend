"use client";

import React from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

const Logout = () => {
  const [showModal, setShowModal] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [name, setname] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiry = payload.exp * 1000;
      return Date.now() > expiry;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    if (token) {
      if (isTokenExpired(token)) {
        localStorage.removeItem("avatar");
        localStorage.removeItem("name");
        setAvatar("");
        setname("");
      } else {
        const storedAvatar = localStorage.getItem("avatar") || "";
        const storedname = localStorage.getItem("name") || "";
        setAvatar(storedAvatar);
        setname(storedname);
      }
    } else {
      setAvatar("");
      setname("");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("avatar");
    localStorage.removeItem("name");
    setAvatar("");
    setname("");
    router.push("/");
  };

  return (
    <section>
      {avatar ? (
        <div className="flex flex-col items-center justify-center gap-1 sm:gap-2 md:gap-5">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-5">
            <img
              src={
                avatar === "default"
                  ? "/profile.png"
                  : `https://express-courses-app-production.up.railway.app/uploads/${avatar}`
              }
              title={name}
              alt="avatar"
              className="w-6 sm:w-8 md:w-10 h-6 sm:h-8 md:h-10 rounded-full object-cover border border-gray-300"
            />
            <button
              onClick={() => setShowModal(true)}
              className="px-2 sm:px-3 md:px-5 py-1.5 sm:py-2 text-[10px] md:text-base rounded-lg md:rounded-xl transition duration-500 
              hover:scale-105 hover:shadow-[0_8px_20px_-8px_rgba(14,165,233,0.6)] cursor-pointer active:scale-90"
            >
              Log out
            </button>
          </div>
          {showModal && (
            <div
              className="absolute top-12 md:top-20 bg-linear-to-t from-[#1c1c1f] via-[#36363b] to-[#1c1c1f] 
               p-3 md:p-7 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.8)] text-center text-gray-300 
               opacity-0 animate-[goDown_1s_ease_forwards]"
            >
              <h2 className="text-[12px] md:text-lg font-bold mb-4">
                Are you sure you want to log out ?
              </h2>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleLogout}
                  className="bg-red-300 text-black hover:bg-white hover:text-red-500 rounded-md shadow-md 
                  p-1 md:p-2 cursor-pointer transition duration-300 shadow-red-500 hover:scale-110  active:scale-95"
                >
                  YES
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-cyan-300 text-black hover:bg-white hover:text-cyan-500 shadow-md rounded-md 
                  p-1 md:p-2 cursor-pointer transition duration-300 shadow-cyan-500 hover:scale-110 active:scale-95"
                >
                  NO
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-1 sm:gap-2 md:gap-5 items-center">
          <Link href={"/login_form"}>
            <button
              type="button"
              className={`px-2 sm:px-3 md:px-5 py-1.5 sm:py-2 rounded-lg md:rounded-xl transition duration-500 
                hover:scale-105 hover:shadow-[0_8px_20px_-8px_rgba(14,165,233,0.6)] cursor-pointer active:scale-90 ${
                  pathname == "/login_form"
                    ? "shadow-[0_8px_20px_-8px_rgba(14,165,233,0.6)]"
                    : "text-[#7dd3fc] animate-[color_1s_ease_infinite_alternate_1s]"
                }`}
            >
              Log in
            </button>
          </Link>
          <Link href={"/register_form"}>
            <button
              type="button"
              className={`px-2 sm:px-3 md:px-5 py-1.5 sm:py-2 rounded-lg md:rounded-xl transition duration-500 
                hover:scale-105 hover:shadow-[0_8px_20px_-8px_rgba(14,165,233,0.6)] cursor-pointer active:scale-90 ${
                  pathname == "/register_form"
                    ? "shadow-[0_8px_20px_-8px_rgba(14,165,233,0.6)]"
                    : "text-[#7dd3fc] animate-[color_1s_ease_infinite_alternate_2s]"
                }`}
            >
              Register
            </button>
          </Link>
        </div>
      )}
    </section>
  );
};

export default Logout;
