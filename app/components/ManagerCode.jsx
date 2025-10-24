"use client";

import React, { useState } from "react";
import Register from "./Register";

const ManagerCode = () => {
  const [usercodetrue, setUsercodetrue] = useState(false);
  const [usercode, setUsercode] = useState("");
  const [error, setError] = useState("");
  const truecode = "خالد";

  const handleCheckCode = () => {
    if (usercode === truecode) {
      setError("");
      alert("تم التحقق بنجاح!");
      setUsercodetrue(true);
    } else {
      setError("الكود غير صحيح!");
    }
  };

  return (
    <section>
      {!usercodetrue && (
        <div
          className="flex flex-col gap-8 items-center justify-center rounded-3xl w-[500px] px-8 py-16 shadow-md hover:shadow-2xl
        opacity-0 animate-[goDown_1s_ease_forwards_.5s] transition duration-300 border-t-4 border-[#111144]"
        >
          <input
            className="w-full p-3 rounded-lg bg-linear-to-r from-[#11114471] to-[#111144de] border placeholder-[#111144e3] text-left direction-ltr
            focus:outline-none focus:ring-2 focus:ring-[#111144] shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] font-semibold"
            onChange={(e) => setUsercode(e.target.value)}
            value={usercode}
            type="password"
            placeholder="أدخل كود الإدارة"
          />
          <button
            onClick={handleCheckCode}
            className="w-full py-3 rounded-2xl font-bold bg-linear-to-r from-[#111144] to-[#111144a9] cursor-pointer active:scale-90
            hover:scale-105 transition transform duration-300 shadow-md"
          >
            تحقق
          </button>
          {error && <p className="text-red-500 font-semibold">{error}</p>}
        </div>
      )}
      {usercodetrue && <Register isManager={true} />}
    </section>
  );
};

export default ManagerCode;
