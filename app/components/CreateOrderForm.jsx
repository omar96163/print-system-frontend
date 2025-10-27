"use client";

import axios from "axios";
import React, { useState } from "react";
import { orderTypes } from "../utils/orderinfo";

const CreateOrderForm = () => {
  const [error, seterror] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [arrayErrors, setarrayErrors] = useState([]);
  const [formData, setFormData] = useState({
    clientName: "",
    contactInfo: "",
    printType: "",
    paperType: "",
    size: "",
    colorOption: "",
    sideOption: "",
    quantity: "",
    clientNotes: "",
    departmentClient: "",
    paperWeight: "",
    finishingOptions: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setarrayErrors((prev) => prev.filter((err) => err.path !== name));
    if (error) seterror("");

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        finishingOptions: checked
          ? [...prev.finishingOptions, value]
          : prev.finishingOptions.filter((opt) => opt !== value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setarrayErrors([]);
    setLoading(true);
    seterror("");

    const bodyFormData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "finishingOptions") {
        formData[key].forEach((opt) => {
          bodyFormData.append("finishingOptions", opt);
        });
      } else {
        bodyFormData.append(key, formData[key]);
      }
    });

    files.forEach((file) => bodyFormData.append("orderFiles", file));

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://print-system-backend-production.up.railway.app/api/orders",
        bodyFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(res.data.message);
      setFormData({
        clientName: "",
        contactInfo: "",
        printType: "",
        paperType: "",
        size: "",
        colorOption: "",
        sideOption: "",
        quantity: 1,
        clientNotes: "",
        departmentClient: "",
        paperWeight: "",
        finishingOptions: [],
      });
      setFiles([]);
      seterror("");
      setarrayErrors([]);
    } catch (err) {
      if (err.response) {
        const errors =
          err.response.data.error || err.response.data.message || "حدث خطأ";
        if (errors) {
          if (Array.isArray(errors)) {
            setarrayErrors(errors);
            seterror("");
          } else {
            seterror(errors);
            setarrayErrors([]);
          }
        }
      } else if (err.request) {
        seterror("لا يوجد اتصال بالإنترنت");
        setarrayErrors([]);
      } else {
        seterror("حدث خطأ غير متوقع");
        setarrayErrors([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    return arrayErrors.find((err) => err.path === fieldName)?.msg || "";
  };

  return (
    <form
      className="rounded-3xl shadow-[0_0_40px_#0b0b2e] backdrop-blur-2xl bg-linear-to-b from-[#111144c2] to-[#0a0a228c] text-gray-100 
      opacity-0 animate-[goUp_0.9s_ease_forwards] transition duration-300 p-10 mt-10"
      onSubmit={handleSubmit}
    >
      <h2 className="font-extrabold text-3xl text-[#111144e3]">
        إختر تفاصيل طلبك
      </h2>

      <div className="border-t border-white/10 pt-6 mt-6">
        <h3 className="font-bold text-lg mb-6 text-[#40E0D0]">معلومات عامة</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* الإسم */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              الاسم
            </label>
            <input
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              placeholder="إسمك"
              className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition placeholder-gray-400"
            />
            {getFieldError("clientName") && (
              <p className="mt-1 text-red-400 font-semibold text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
                {getFieldError("clientName")}
              </p>
            )}
          </div>

          {/* معلومات التواصل */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              معلومات التواصل
            </label>
            <input
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleChange}
              placeholder="معلومات التواصل"
              className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition placeholder-gray-400"
            />
            {getFieldError("contactInfo") && (
              <p className="mt-1 text-red-400 font-semibold text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
                {getFieldError("contactInfo")}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* نوع الطلب */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              نوع الطلب
            </label>
            <select
              name="printType"
              value={formData.printType}
              onChange={handleChange}
              className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition"
            >
              <option>إختر نوع الطلب</option>
              {orderTypes.printType.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {getFieldError("printType") && (
              <p className="mt-1 text-red-400 font-semibold text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
                {getFieldError("printType")}
              </p>
            )}
          </div>

          {/* نوع الورق */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              نوع الورق
            </label>
            <select
              name="paperType"
              value={formData.paperType}
              onChange={handleChange}
              className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition"
            >
              <option>إختر نوع الورق</option>
              {orderTypes.paperType.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {getFieldError("paperType") && (
              <p className="mt-1 text-red-400 font-semibold text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
                {getFieldError("paperType")}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* مقاس الورق */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              المقاس
            </label>
            <select
              name="size"
              value={formData.size}
              onChange={handleChange}
              className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition"
            >
              <option>إختر المقاس</option>
              {orderTypes.size.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            {getFieldError("size") && (
              <p className="mt-1 text-red-400 font-semibold text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
                {getFieldError("size")}
              </p>
            )}
          </div>

          {/* الألوان */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              الألوان
            </label>
            <select
              name="colorOption"
              value={formData.colorOption}
              onChange={handleChange}
              required
              className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition"
            >
              <option>إختر الألوان</option>
              {orderTypes.colorOption.map((opt) => (
                <option className="bg-[#111144de]" key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {getFieldError("colorOption") && (
              <p className="mt-1 text-red-400 font-semibold text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
                {getFieldError("colorOption")}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* وزن الورق */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              وزن الورق
            </label>
            <input
              name="paperWeight"
              placeholder="أدخل وزن الورق - مثال: 80 جم/م²"
              value={formData.paperWeight}
              onChange={handleChange}
              className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition"
            />
          </div>

          {/*  وجه الطباعة */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              وجه الطباعة
            </label>
            <select
              name="sideOption"
              value={formData.sideOption}
              onChange={handleChange}
              required
              className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition"
            >
              <option>إختر وجه الطباعة</option>
              {orderTypes.sideOption.map((opt) => (
                <option className="bg-[#111144de]" key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {getFieldError("sideOption") && (
              <p className="mt-1 text-red-400 font-semibold text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
                {getFieldError("sideOption")}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* الكميه */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              الكميه
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition"
            />
            {getFieldError("quantity") && (
              <p className="mt-1 text-red-400 font-semibold text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
                {getFieldError("quantity")}
              </p>
            )}
          </div>

          {/* حهة العميل */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              جهة العميل
            </label>
            <input
              name="departmentClient"
              placeholder="أدخل جهة عملك"
              value={formData.departmentClient}
              onChange={handleChange}
              className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition"
            />
          </div>
        </div>

        {/*  ملاحظات العميل */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            ملاحظات العميل
          </label>
          <textarea
            name="clientNotes"
            placeholder="أدخل ملاحظات طلبك"
            value={formData.clientNotes}
            onChange={handleChange}
            className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition"
            rows="2"
          />
        </div>

        {/* الإنهاء */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            خيارات الإنهاء
          </label>
          <div className="flex flex-wrap gap-3">
            {orderTypes.finishingOptions.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 bg-[#17174a]/50 px-3 py-1.5 rounded-lg border border-[#30307a] hover:bg-[#23235c] cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  name="finishingOptions"
                  value={opt}
                  checked={(formData.finishingOptions || []).includes(opt)}
                  onChange={handleChange}
                  className="accent-[#40E0D0]"
                />
                <span className="text-gray-200 text-sm">{opt}</span>
              </label>
            ))}
          </div>
          {getFieldError("finishingOptions") && (
            <p className="mt-1 text-red-400 font-semibold text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
              {getFieldError("finishingOptions")}
            </p>
          )}
        </div>

        {/* رفع الملفات */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            رفع الملفات
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip,.rar,.txt"
            className="w-full p-3 bg-[#141440]/70 border border-[#30307a] rounded-xl text-gray-200 cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-[#40E0D0] file:text-[#0d0d26] hover:file:bg-[#2dd4bf] transition text-left direction-ltr"
          />
        </div>
      </div>

      {error && (
        <p className="text-red-400 font-semibold mb-8 text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2.5 bg-linear-to-r from-[#40e0d0] to-[#2dd4be83] text-[#0d0d26] font-bold rounded-xl shadow-lg hover:scale-105 transition transform duration-300 disabled:opacity-50 cursor-pointer active:scale-90"
      >
        {loading ? "جاري التحميل ..." : "إرسال الطلب"}
      </button>
    </form>
  );
};

export default CreateOrderForm;
