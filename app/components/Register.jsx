"use client";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { roles } from "../utils/roles";

const Register = ({ isManager }) => {
  const router = useRouter();
  const [name, setname] = useState("");
  const [error, seterror] = useState("");
  const [email, setemail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [password, setpassword] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(roles.CLIENT);
  const [arrayerrors, setarrayerrors] = useState([]);

  const Register = async (name, email, avatar, password, role) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("role", role);
    formData.append("email", email);
    formData.append("avatar", avatar);
    formData.append("password", password);

    try {
      const res = await axios.post(
        "https://print-system-backend-production.up.railway.app/api/users/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const { token, name, role, _id, email: userEmail } = res.data.data.user;
      localStorage.setItem("token", token);
      localStorage.setItem("name", name);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", _id);
      localStorage.setItem("email", userEmail);
      setname("");
      seterror("");
      setemail("");
      setpassword("");
      setAvatar(null);
      setPreview(null);
      setarrayerrors([]);
      setRole(roles.CLIENT);
      router.push("/MyAccount");
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400 || err.response.status === 500) {
          const errors = err.response.data.message;
          if (Array.isArray(errors)) {
            setarrayerrors(errors);
            seterror("");
          } else {
            seterror(errors);
            setarrayerrors([]);
          }
        }
      } else if (err.request) {
        seterror("لا يوجد اتصال بالإنترنت");
        setarrayerrors([]);
      } else {
        seterror("حدث خطأ غير متوقع");
        setarrayerrors([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Register(name, email, avatar, password, role);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <form
      className="flex flex-col gap-8 items-center justify-center rounded-3xl w-[500px] px-8 py-16 shadow-md hover:shadow-2xl
        opacity-0 animate-[goDown_1s_ease_forwards_.5s] transition duration-300 border-t-4 border-[#111144]"
      onSubmit={handleSubmit}
    >
      <h2 className="font-extrabold text-3xl text-[#111144e3] animate-[color_2s_ease_infinite_alternate_1s]">
        أهلاً بك في خدمتنا
      </h2>
      <div className="w-full flex items-center justify-center">
        <label
          className="w-52 h-52 flex items-center justify-center rounded-full bg-linear-to-r from-[#111144] to-[#111144a9] overflow-hidden
            shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] cursor-pointer transition duration-300 ring-4 hover:ring-[#111144c9]"
        >
          {preview ? (
            <img
              src={preview}
              alt="avatar preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[16px]">
              +<span> أضف صوره شخصية</span>
            </span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
      <div className="w-full">
        <input
          className="w-full p-3 rounded-lg bg-linear-to-r from-[#11114471] to-[#111144de] border placeholder-[#111144e3] text-left direction-ltr
          focus:outline-none focus:ring-2 focus:ring-[#111144] shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] font-semibold"
          onChange={(e) => {
            setname(e.target.value);
            if (error || arrayerrors.length > 0) {
              seterror("");
              setarrayerrors([]);
            }
          }}
          value={name}
          type="text"
          placeholder="أدخل إسمك"
        />
        {arrayerrors
          .filter((err) => err.path === "name")
          .map((err, index) => (
            <p
              key={index}
              className="text-red-500 font-bold mt-3 text-center underline"
            >
              {err.msg}
            </p>
          ))}
      </div>
      <div className="w-full">
        <input
          className="w-full p-3 rounded-lg bg-linear-to-r from-[#11114471] to-[#111144de] border placeholder-[#111144e3] text-left direction-ltr
              focus:outline-none focus:ring-2 focus:ring-[#111144] shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] font-semibold"
          onChange={(e) => {
            setemail(e.target.value);
            if (error || arrayerrors.length > 0) {
              seterror("");
              setarrayerrors([]);
            }
          }}
          value={email}
          type="email"
          placeholder="البريد الإلكتروني"
        />
        {arrayerrors
          .filter((err) => err.path === "email")
          .map((err, index) => (
            <p
              key={index}
              className="text-red-500 font-bold mt-3 text-center underline"
            >
              {err.msg}
            </p>
          ))}
      </div>
      <div className="w-full">
        <input
          className="w-full p-3 rounded-lg bg-linear-to-r from-[#11114471] to-[#111144de] border placeholder-[#111144e3] text-left direction-ltr
          focus:outline-none focus:ring-2 focus:ring-[#111144] shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] font-semibold"
          onChange={(e) => {
            setpassword(e.target.value);
            if (error || arrayerrors.length > 0) {
              seterror("");
              setarrayerrors([]);
            }
          }}
          value={password}
          type="password"
          placeholder="كلمة المرور"
        />
        {arrayerrors
          .filter((err) => err.path === "password")
          .map((err, index) => (
            <p
              key={index}
              className="text-red-500 font-bold mt-3 text-center underline"
            >
              {err.msg}
            </p>
          ))}
      </div>
      {isManager && (
        <div className="w-full">
          <select
            className="w-full p-3 rounded-lg bg-linear-to-r from-[#11114471] to-[#111144de] border placeholder-[#111144e3] text-left direction-ltr
            focus:outline-none focus:ring-2 focus:ring-[#111144] shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] font-semibold"
            onChange={(e) => {
              setRole(e.target.value);
              if (error || arrayerrors.length > 0) {
                seterror("");
                setarrayerrors([]);
              }
            }}
          >
            <option>{roles.CLIENT}</option>
            <option>{roles.MANAGER}</option>
            <option>{roles.SUPPORT}</option>
            <option>{roles.PRINT_EMPLOYEE}</option>
            <option>{roles.DEPARTMENT_MANAGER}</option>
          </select>
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-2xl font-bold bg-linear-to-r from-[#111144] to-[#111144a9] cursor-pointer active:scale-90
            hover:scale-105 transition transform duration-300 shadow-md ${
              loading ? "cursor-not-allowed opacity-70" : ""
            }`}
      >
        {loading ? "جاري التحميل ..." : "إنشاء حساب"}
      </button>
      {error && (
        <p className="text-red-500 font-semibold underline text-center">
          {error}
        </p>
      )}
    </form>
  );
};

export default Register;
