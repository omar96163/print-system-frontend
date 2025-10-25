"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { orderTypes } from "../utils/orderinfo";
import { roles } from "../utils/roles";

const EditOrderForm = ({ orderId, currentOrder, onClose, onSuccess }) => {
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
    quantity: "",
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
        quantity: currentOrder.quantity || "",
        clientNotes: currentOrder.clientNotes || "",
        departmentClient: currentOrder.departmentClient || "",
        paperWeight: currentOrder.paperWeight || "",
        finishingOptions: Array.isArray(currentOrder.finishingOptions)
          ? currentOrder.finishingOptions
          : [],
        status: currentOrder.status || "",
        totalPrice: currentOrder.totalPrice || "",
        departmentWork: currentOrder.departmentWork || "",
        departmentNotes: "",
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

    // ✅ دالة محسّنة للتحقق من التغييرات
    const hasFieldChanges = () => {
      const simpleFields = [
        "clientName",
        "contactInfo",
        "printType",
        "paperType",
        "size",
        "colorOption",
        "sideOption",
        "quantity",
        "clientNotes",
        "departmentClient",
        "paperWeight",
        "status",
      ];

      // إضافة الحقول الإدارية إذا لم يكن العميل
      if (role !== roles.CLIENT) {
        simpleFields.push("totalPrice", "departmentWork");
      }

      // التحقق من الحقول البسيطة
      for (const field of simpleFields) {
        if (formData[field] !== (currentOrder[field] || "")) {
          return true;
        }
      }

      // مقارنة finishingOptions
      const currentFinishing = Array.isArray(currentOrder.finishingOptions)
        ? currentOrder.finishingOptions
        : [];
      const formFinishing = formData.finishingOptions || [];

      if (
        JSON.stringify(currentFinishing.sort()) !==
        JSON.stringify(formFinishing.sort())
      ) {
        return true;
      }

      // ✅ التحقق من departmentNotes (إذا كان هناك ملاحظة جديدة غير فاضية)
      if (
        role !== roles.CLIENT &&
        typeof formData.departmentNotes === "string" &&
        formData.departmentNotes.trim() !== ""
      ) {
        return true;
      }

      return false;
    };

    if (!hasFieldChanges() && files.length === 0) {
      setError("لم يتم تغيير أي بيانات");
      setLoading(false);
      return;
    }

    // ✅ تجهيز البيانات للإرسال
    const bodyFormData = new FormData();

    // ✅ إزالة الحقول المحظورة للعميل قبل الإرسال
    const dataToSend = { ...formData };

    if (role === roles.CLIENT) {
      delete dataToSend.totalPrice;
      delete dataToSend.departmentWork;
      delete dataToSend.departmentNotes;
    }

    Object.keys(dataToSend).forEach((key) => {
      if (key === "finishingOptions") {
        dataToSend[key].forEach((opt) =>
          bodyFormData.append("finishingOptions", opt)
        );
      } else if (dataToSend[key] !== currentOrder[key]) {
        bodyFormData.append(key, dataToSend[key]);
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
      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    } catch (err) {
      if (err.response) {
        console.log(err.response.data.error);
        const errors =
          err.response.data.error || err.response.data.message || "حدث خطأ";
        if (errors) {
          if (Array.isArray(errors)) {
            setArrayErrors(errors);
            setError("");
          } else {
            setError(errors);
            setArrayErrors([]);
          }
        }
      } else if (err.request) {
        setError("لا يوجد اتصال بالإنترنت");
        setArrayErrors([]);
      } else {
        setError("حدث خطأ غير متوقع");
        setArrayErrors([]);
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
      opacity-0 animate-[goDown_0.9s_ease_forwards] transition duration-300 mt-20"
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
          <div className="flex justify-between items-center">
            <h2 className="text-4xl font-extrabold text-white tracking-wide drop-shadow-lg">
              تعديل الطلب{" "}
              <span className="text-[#40E0D0]">
                # {currentOrder.orderNumber}
              </span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-[#40E0D0] text-4xl transition transform hover:scale-110 cursor-pointer"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* الحقول العامة */}
            <div className="border-t border-white/10 pt-6 mt-6">
              <h3 className="font-bold text-lg mb-6 text-[#40E0D0]">
                معلومات عامة
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    الاسم
                  </label>
                  <input
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition placeholder-gray-400"
                  />
                  {getFieldError("clientName") && (
                    <p className="mt-1 text-red-400 font-semibold text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
                      {getFieldError("clientName")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    معلومات التواصل
                  </label>
                  <input
                    name="contactInfo"
                    value={formData.contactInfo}
                    onChange={handleChange}
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
                    {orderTypes.printType.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

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
                    {orderTypes.paperType.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                    {orderTypes.size.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

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
                    {orderTypes.colorOption.map((opt) => (
                      <option className="bg-[#111144de]" key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    وزن الورق
                  </label>
                  <input
                    name="paperWeight"
                    placeholder="وزن الورق - مثال: 80 جم/م²"
                    value={formData.paperWeight}
                    onChange={handleChange}
                    className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition"
                  />
                </div>

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
                    {orderTypes.sideOption.map((opt) => (
                      <option className="bg-[#111144de]" key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    جهة العميل
                  </label>
                  <input
                    name="departmentClient"
                    placeholder="جهة العميل"
                    value={formData.departmentClient}
                    onChange={handleChange}
                    className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  ملاحظات العميل
                </label>
                <textarea
                  name="clientNotes"
                  placeholder="ملاحظات العميل"
                  value={formData.clientNotes}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition"
                  rows="2"
                />
              </div>

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
                        checked={(formData.finishingOptions || []).includes(
                          opt
                        )}
                        onChange={handleChange}
                        className="accent-[#40E0D0]"
                      />
                      <span className="text-gray-200 text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

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

              {role !== roles.CLIENT && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        سعر الطلب
                      </label>
                      <input
                        type="number"
                        name="totalPrice"
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
                      ملاحظات الإدارة (جديدة)
                    </label>
                    <textarea
                      name="departmentNotes"
                      placeholder="أضف ملاحظة جديدة..."
                      value={formData.departmentNotes}
                      onChange={handleChange}
                      className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition"
                      rows="2"
                    />
                  </div>
                </>
              )}
            </div>

            {error && (
              <p className="text-red-400 font-semibold mb-8 text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-4 mt-10">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#30307a]/40 text-gray-200 font-bold rounded-xl shadow-lg hover:scale-105 transition transform duration-300 disabled:opacity-50 cursor-pointer active:scale-90"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-linear-to-r from-[#40e0d0] to-[#2dd4be83] text-[#0d0d26] font-bold rounded-xl shadow-lg hover:scale-105 transition transform duration-300 disabled:opacity-50 cursor-pointer active:scale-90"
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
