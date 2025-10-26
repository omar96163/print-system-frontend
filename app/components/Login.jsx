"use client";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Login = () => {
  const router = useRouter();
  const [error, seterror] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [loading, setLoading] = useState(false);

  const Login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(
        "https://print-system-backend-production.up.railway.app/api/users/login",
        { email, password }
      );
      const { token, name, role, _id, email: userEmail } = res.data.data.user;
      localStorage.setItem("token", token);
      localStorage.setItem("name", name);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", _id);
      localStorage.setItem("email", userEmail);
      setemail("");
      seterror("");
      setpassword("");
      router.push("/MyAccount");
    } catch (err) {
      if (err.response) {
        seterror(
          err.response.data.error || err.response.data.message || "حدث خطأ"
        );
      } else if (err.request) {
        seterror("لا يوجد اتصال بالإنترنت");
      } else {
        seterror("حدث خطأ غير متوقع");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Login(email, password);
  };

  return (
    <form
      className="flex flex-col gap-14 items-center justify-center rounded-3xl lg:w-[500px] px-8 py-16 shadow-md hover:scale-105 hover:shadow-2xl
      opacity-0 animate-[goDown_1s_ease_forwards_.5s] transition duration-300 border-t-4 border-[#111144]"
      onSubmit={handleSubmit}
    >
      <h2 className="font-extrabold text-3xl text-[#111144e3] animate-[color_2s_ease_infinite_alternate_1s]">
        مرحباً بك مجدداً
      </h2>

      <input
        type="email"
        placeholder="البريد الإلكتروني"
        value={email}
        onChange={(e) => {
          setemail(e.target.value);
          if (error) seterror("");
        }}
        className="w-full p-3 rounded-lg bg-linear-to-r from-[#11114471] to-[#111144de] border placeholder-[#111144e3] text-left direction-ltr
        focus:outline-none focus:ring-2 focus:ring-[#111144] shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] font-semibold"
      />

      <input
        type="password"
        placeholder="كلمة المرور"
        value={password}
        onChange={(e) => {
          setpassword(e.target.value);
          if (error) seterror("");
        }}
        className="w-full p-3 rounded-lg bg-linear-to-r from-[#11114471] to-[#111144de] border placeholder-[#111144e3] text-left direction-ltr
        focus:outline-none focus:ring-2 focus:ring-[#111144] shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] font-semibold"
      />

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-2xl font-bold bg-linear-to-r from-[#111144] to-[#111144a9] cursor-pointer active:scale-90
        hover:scale-105 transition transform duration-300 shadow-md ${
          loading ? "cursor-not-allowed opacity-70" : ""
        }`}
      >
        {loading ? "جاري التحميل ..." : "تسجيل الدخول"}
      </button>

      {error && <p className="text-red-500 font-semibold underline">{error}</p>}
    </form>
  );
};

export default Login;
