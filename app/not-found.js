import React from "react";
import Link from "next/link";

const Notfound = () => {
  return (
    <main className="h-screen w-full flex flex-col justify-center items-center">
      <h1 className="text-9xl font-extrabold text-[#111144b9]">404</h1>
      <div className="bg-[#111144] px-2 text-sm rounded rotate-12 absolute">
        Page Not Found
      </div>
      <Link href={"/"}>
        <button
          type="button"
          className="mt-5 bg-[#11114480] text-black hover:bg-white hover:text-[#111144e3] shadow-md rounded-md p-1.5 
          cursor-pointer transition duration-300 shadow-[#111144e3] hover:scale-110 active:scale-95"
        >
          Go Home
        </button>
      </Link>
    </main>
  );
};

export default Notfound;
