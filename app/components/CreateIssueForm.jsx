"use client";
import React, { useState } from "react";
import axios from "axios";

const CreateIssueForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contactInfo: "",
  });
  const [files, setFiles] = useState([]);
  const [error, seterror] = useState("");
  const [loading, setLoading] = useState(false);
  const [arrayerrors, setarrayerrors] = useState([]);

  // تغيير القيم
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // اختيار الملفات
  const handleFilesChange = (e) => {
    setFiles(e.target.files);
  };

  // إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    setarrayerrors([]);
    seterror("");

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("contactInfo", formData.contactInfo);

    for (let i = 0; i < files.length; i++) {
      data.append("issueFiles", files[i]);
    }

    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      const res = await axios.post(
        "https://print-system-backend-production.up.railway.app/api/issues",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(res);
      alert(res.data.message);
      setFormData({ title: "", description: "", contactInfo: "" });
      setFiles([]);
    } catch (err) {
      console.log(err);
      if (err.response) {
        if (err.response.status === 400 || err.response.status === 500) {
          const errors = err.response.data.Error;
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

  return (
    <form
      className="rounded-3xl shadow-[0_0_40px_#0b0b2e] backdrop-blur-2xl bg-linear-to-b from-[#111144c2] to-[#0a0a228c] text-gray-100 
      opacity-0 animate-[goUp_0.9s_ease_forwards] transition duration-300 p-10 mt-10"
      onSubmit={handleSubmit}
    >
      <h2 className="font-extrabold text-3xl text-[#111144e3] text-center">
        تسجيل عطل جديد
      </h2>

      <div className="border-t border-white/10 pt-6 mt-6 flex flex-col gap-5">
        <div>
          <label className="block text-gray-300 mb-2">العنوان</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] 
            focus:outline-none transition placeholder-gray-400"
            placeholder="اكتب عنوان المشكلة..."
          />
          {arrayerrors
            .filter((err) => err.path === "title")
            .map((err, index) => (
              <p
                key={index}
                className="mt-2 px-1.5 text-red-400 font-semibold mb-8 text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md"
              >
                {err.msg}
              </p>
            ))}
        </div>

        <div>
          <label className="block text-gray-300 mb-2">الوصف</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] 
            focus:outline-none transition placeholder-gray-400"
            placeholder="صف المشكلة بالتفصيل..."
          ></textarea>
          {arrayerrors
            .filter((err) => err.path === "description")
            .map((err, index) => (
              <p
                key={index}
                className="px-1.5 text-red-400 font-semibold mb-8 text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md"
              >
                {err.msg}
              </p>
            ))}
        </div>

        <div>
          <label className="block text-gray-300 mb-2">معلومات التواصل</label>
          <input
            type="text"
            name="contactInfo"
            value={formData.contactInfo}
            onChange={handleChange}
            className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] 
            focus:outline-none transition placeholder-gray-400"
            placeholder="رقم الهاتف أو البريد الإلكتروني..."
          />
          {arrayerrors
            .filter((err) => err.path === "contactInfo")
            .map((err, index) => (
              <p
                key={index}
                className="mt-2 px-1.5 text-red-400 font-semibold mb-8 text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md"
              >
                {err.msg}
              </p>
            ))}
        </div>

        <div>
          <label className="block text-gray-300 mb-2">إرفاق ملفات</label>
          <input
            type="file"
            multiple
            onChange={handleFilesChange}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip,.rar,.txt"
            className="w-full p-3 bg-[#141440]/70 border border-[#30307a] rounded-xl text-gray-200 cursor-pointer file:mr-3 file:py-1 transition
            file:px-3 file:rounded-md file:border-0 file:bg-[#40E0D0] file:text-[#0d0d26] hover:file:bg-[#2dd4bf] text-left direction-ltr"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2.5 bg-linear-to-r from-[#40e0d0] to-[#2dd4be83] text-[#0d0d26] font-bold rounded-xl shadow-lg
        hover:scale-105 transition transform duration-300 disabled:opacity-50 cursor-pointer active:scale-90 mt-10"
      >
        {loading ? "جاري الإرسال ..." : "إرسال البلاغ"}
      </button>

      {error && (
        <p className="text-red-400 font-semibold mb-8 text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
          {error}
        </p>
      )}
    </form>
  );
};

export default CreateIssueForm;
