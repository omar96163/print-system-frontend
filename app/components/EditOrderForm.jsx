// src/components/EditOrderForm.jsx
"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { orderTypes } from "../utils/orderinfo";

const EditOrderForm = ({ orderId, currentOrder, onClose }) => {
  const role = localStorage.getItem("role");
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [arrayErrors, setArrayErrors] = useState([]);
  const [formData, setFormData] = useState({
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
    status: "",
    totalPrice: "",
    departmentWork: "",
    departmentNotes: "",
  });

  // تهيئة الحقول من الطلب الحالي
  useEffect(() => {
    if (currentOrder) {
      setFormData({
        clientName: currentOrder.clientName || "",
        contactInfo: currentOrder.contactInfo || "",
        printType: currentOrder.printType || "",
        paperType: currentOrder.paperType || "",
        size: currentOrder.size || "",
        colorOption: currentOrder.colorOption || "",
        sideOption: currentOrder.sideOption || "",
        quantity: currentOrder.quantity || 1,
        clientNotes: currentOrder.clientNotes || "",
        departmentClient: currentOrder.departmentClient || "",
        paperWeight: currentOrder.paperWeight || "",
        finishingOptions: Array.isArray(currentOrder.finishingOptions)
          ? currentOrder.finishingOptions
          : [],
        status: currentOrder.status || "",
        totalPrice: currentOrder.totalPrice || "",
        departmentWork: currentOrder.departmentWork || "",
        departmentNotes: currentOrder.departmentNotes || "",
      });
    }
  }, [currentOrder]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setArrayErrors((prev) => prev.filter((err) => err.path !== name));
    setError("");

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        finishingOptions: checked
          ? [...(prev.finishingOptions || []), value]
          : (prev.finishingOptions || []).filter((opt) => opt !== value),
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
    setArrayErrors([]);
    setLoading(true);
    setError("");

    const bodyFormData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "finishingOptions") {
        formData[key].forEach((opt) =>
          bodyFormData.append("finishingOptions", opt)
        );
      } else if (formData[key] !== "") {
        bodyFormData.append(key, formData[key]);
      }
    });

    // إضافة الملفات
    files.forEach((file) => bodyFormData.append("orderFiles", file));

    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `https://print-system-backend-production.up.railway.app/api/orders/${orderId}`,
        bodyFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(res.data.message);
      onClose();
    } catch (err) {
      if (err.response) {
        setError(
          err.response.data.error || err.response.data.message || "حدث خطأ"
        );
      } else if (err.request) {
        setError("لا يوجد اتصال بالإنترنت");
      } else {
        setError("حدث خطأ غير متوقع");
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    return arrayErrors.find((err) => err.path === fieldName)?.msg || "";
  };

  return (
    <div
      className="rounded-3xl shadow-[0_0_40px_#0b0b2e] backdrop-blur-2xl bg-linear-to-br from-[#111144a9] via-[#16163fb4] to-[#0a0a22ab] text-gray-100 
      opacity-0 animate-[goDown_0.9s_ease_forwards] transition duration-300"
    >
      <div className="rounded-3xl shadow-inner w-full max-w-3xl max-h-[92vh] overflow-y-auto border border-white/10 scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent">
        <style jsx>{`
          ::-webkit-scrollbar {
            width: 0;
            height: 0;
          }
          ::-webkit-scrollbar-thumb {
            background: transparent;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
        `}</style>

        <div className="p-10">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-4xl font-extrabold text-white tracking-wide drop-shadow-lg">
              تعديل الطلب{" "}
              <span className="text-[#40E0D0]">
                # {currentOrder.orderNumber}
              </span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-[#40E0D0] text-4xl transition transform hover:scale-110"
            >
              &times;
            </button>
          </div>

          {error && (
            <p className="text-red-400 font-semibold mb-8 text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            {/* الحقول الأساسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className={`${role }`}>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  الاسم
                </label>
                <input
                  name="clientName"
                  placeholder={formData.clientName}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  التواصل
                </label>
                <input
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition placeholder-gray-400"
                />
              </div>
            </div>

            {/* نوع الطلب */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                نوع الطلب
              </label>
              <select
                name="printType"
                value={formData.printType}
                onChange={handleChange}
                className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl text-gray-100 focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition"
              >
                <option value="">اختر النوع</option>
                {orderTypes.printType.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* باقي الحقول */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                  <option value="">اختر النوع</option>
                  {orderTypes.paperType.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
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
                  <option value="">اختر المقاس</option>
                  {orderTypes.size.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* الكمية */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                الكمية
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition"
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
            </div>

            {/* الحقول الإدارية */}
            <div className="border-t border-white/10 pt-6 mt-6">
              <h3 className="font-bold text-lg mb-4 text-[#40E0D0]">
                معلومات إدارية
              </h3>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  الحالة
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition"
                >
                  {orderTypes.status.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    سعر الطلب
                  </label>
                  <input
                    type="number"
                    name="totalPrice"
                    min="0"
                    value={formData.totalPrice}
                    onChange={handleChange}
                    className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    قسم العمل
                  </label>
                  <select
                    name="departmentWork"
                    value={formData.departmentWork}
                    onChange={handleChange}
                    className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition"
                  >
                    <option value="">اختر القسم</option>
                    {orderTypes.departmentWork.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  ملاحظات الإدارة
                </label>
                <textarea
                  name="departmentNotes"
                  value={formData.departmentNotes}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition"
                  rows="2"
                />
              </div>
            </div>

            {/* رفع الملفات */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                الملفات الجديدة (اختياري)
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip,.rar,.txt"
                className="w-full p-3 bg-[#141440]/70 border border-[#30307a] rounded-xl text-gray-200 cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-[#40E0D0] file:text-[#0d0d26] hover:file:bg-[#2dd4bf] transition"
              />
            </div>

            {/* الأزرار */}
            <div className="flex justify-end gap-4 mt-10">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#30307a]/40 text-gray-200 rounded-xl hover:bg-[#4040a0]/60 transition font-semibold shadow-md"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-linear-to-r from-[#40E0D0] to-[#2dd4bf] text-[#0d0d26] font-bold rounded-xl shadow-lg hover:from-[#2dd4bf] hover:to-[#40E0D0] transition disabled:opacity-70"
              >
                {loading ? "جاري التحديث..." : "تحديث الطلب"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditOrderForm;
