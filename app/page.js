"use client";

import React, { useState } from "react";
import Image from "next/image";
import Login from "./components/Login";
import Register from "./components/Register";
import ManagerCode from "./components/ManagerCode";

const Home = () => {
  const [log, setlog] = useState(true);
  const [manaegrlog, setmanaegrlog] = useState(false);

  return (
    <section className="min-h-screen flex flex-col md:flex-row items-center justify-around gap-y-10 gap-x-20 p-5">
      {/* الصورة والزر */}
      <section className="flex flex-col items-center justify-center gap-5">
        <Image
          src="/شعار-الجامعة.png"
          alt="Printing Service"
          width={400}
          height={400}
          className="object-contain rounded-lg opacity-0 animate-[goUp_1s_ease_forwards_.5s]"
        />

        <button
          type="button"
          onClick={() => {
            setlog(!log);
            setmanaegrlog(false);
          }}
          className="px-6 py-3 rounded-lg transition duration-300 cursor-pointer w-full font-bold text-center opacity-0 animate-[goUp_1s_ease_forwards_.8s]
          bg-linear-to-r from-[#11114471] to-[#111144de] hover:scale-105 hover:shadow-2xl"
        >
          <strong className="inline-block transition duration-300 animate-bounce">
            {log ? "إنشاء حساب" : "تسجيل دخول"}
          </strong>
        </button>

        <button
          type="button"
          onClick={() => {
            setmanaegrlog(true);
            setlog(" ");
          }}
          className="px-6 py-3 rounded-lg transition duration-300 cursor-pointer w-full font-bold text-center opacity-0 animate-[goUp_1s_ease_forwards_1.1s]
          bg-linear-to-r from-[#11114471] to-[#111144de] hover:scale-105 hover:shadow-2xl"
        >
          الإداره
        </button>
      </section>

      {/* الفورم */}
      <section>
        {log === true ? <Login /> : log === false ? <Register /> : <></>}
        {manaegrlog && <ManagerCode />}
      </section>
      
    </section>
  );
};

export default Home;
