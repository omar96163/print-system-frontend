import React, { useState } from "react";
import axios from "axios";
import { orderTypes } from "../utils/orderinfo";

const CreateOrderForm = () => {
  const [error, seterror] = useState("");
  const [loading, setLoading] = useState(false);
  const [arrayerrors, setarrayerrors] = useState([]);
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
  });

  const [files, setFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setarrayerrors((prev) => prev.filter((err) => err.path !== name));
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
    seterror("");
    setarrayerrors([]);
    setLoading(true);

    const token = localStorage.getItem("token");

    const bodyFormData = new FormData();

    // إضافة الحقول النصية
    Object.keys(formData).forEach((key) => {
      if (key === "finishingOptions") {
        formData[key].forEach((opt) => {
          bodyFormData.append("finishingOptions", opt);
        });
      } else {
        bodyFormData.append(key, formData[key]);
      }
    });

    // إضافة الملفات
    files.forEach((file) => {
      bodyFormData.append("orderFiles", file);
    });

    try {
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

      console.log(res.data.data.order);
      alert("تم إنشاء الطلب بنجاح!");
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
      setarrayerrors([]);
    } catch (err) {
      if (err.response) {
        console.log(err.response.data.error);
        const errors =
          err.response.data.error || err.response.data.message || "حدث خطأ";
        if (errors) {
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
      className="flex flex-col gap-14 items-center justify-center rounded-3xl w-[700px] px-8 py-16 shadow-md hover:shadow-2xl 
      opacity-0 animate-[goUp_1s_ease_forwards] transition duration-300 border-t-4 border-[#111144] mt-10"
      onSubmit={handleSubmit}
    >
      <h2 className="font-extrabold text-3xl text-[#111144e3] animate-[color_2s_ease_infinite_alternate_1s]">
        إختر تفاصيل طلبك
      </h2>
      <input
        name="clientName"
        placeholder="أدخل إسمك"
        value={formData.clientName}
        onChange={handleChange}
        required
        className="w-full p-3 rounded-lg bg-linear-to-r from-[#11114471] to-[#111144de] border text-white
        focus:outline-none focus:ring-2 focus:ring-[#111144] shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] font-semibold"
      />
      {arrayerrors
        .filter((err) => err.path === "clientName")
        .map((err, index) => (
          <p
            key={index}
            className="text-red-500 font-bold text-center underline"
          >
            {err.msg}
          </p>
        ))}
      <input
        name="contactInfo"
        placeholder="معلومات التواصل (رقم جوال أو بريد)"
        value={formData.contactInfo}
        onChange={handleChange}
        required
        className="w-full p-3 rounded-lg bg-linear-to-r from-[#11114471] to-[#111144de] border text-white
        focus:outline-none focus:ring-2 focus:ring-[#111144] shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] font-semibold"
      />
      {arrayerrors
        .filter((err) => err.path === "contactInfo")
        .map((err, index) => (
          <p
            key={index}
            className="text-red-500 font-bold text-center underline"
          >
            {err.msg}
          </p>
        ))}
      <select
        name="printType"
        value={formData.printType}
        onChange={handleChange}
        required
        className="w-full p-3 rounded-lg bg-linear-to-r from-[#11114471] to-[#111144de] border text-white
        focus:outline-none focus:ring-2 focus:ring-[#111144] shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] font-semibold"
      >
        <option value="">اختر نوع الطلب</option>
        {orderTypes.printType.map((opt) => (
          <option className="bg-[#111144de]" key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <select
        name="paperType"
        value={formData.paperType}
        onChange={handleChange}
        required
        className="w-full p-3 rounded-lg bg-linear-to-r from-[#11114471] to-[#111144de] border text-white
        focus:outline-none focus:ring-2 focus:ring-[#111144] shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] font-semibold"
      >
        <option value="">نوع الورق</option>
        {orderTypes.paperType.map((opt) => (
          <option className="bg-[#111144de]" key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <select
        name="size"
        value={formData.size}
        onChange={handleChange}
        required
        className="w-full p-3 rounded-lg bg-linear-to-r from-[#11114471] to-[#111144de] border text-white
        focus:outline-none focus:ring-2 focus:ring-[#111144] shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] font-semibold"
      >
        <option value="">مقاس الورق</option>
        {orderTypes.size.map((opt) => (
          <option className="bg-[#111144de]" key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <select
        name="colorOption"
        value={formData.colorOption}
        onChange={handleChange}
        required
        className="w-full p-3 rounded-lg bg-linear-to-r from-[#11114471] to-[#111144de] border text-white
        focus:outline-none focus:ring-2 focus:ring-[#111144] shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] font-semibold"
      >
        <option value="">الألوان</option>
        {orderTypes.colorOption.map((opt) => (
          <option className="bg-[#111144de]" key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <select
        name="sideOption"
        value={formData.sideOption}
        onChange={handleChange}
        required
        className="w-full p-3 rounded-lg bg-linear-to-r from-[#11114471] to-[#111144de] border text-white
        focus:outline-none focus:ring-2 focus:ring-[#111144] shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] font-semibold"
      >
        <option value="">الوجه</option>
        {orderTypes.sideOption.map((opt) => (
          <option className="bg-[#111144de]" key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <input
        type="number"
        name="quantity"
        value={formData.quantity}
        onChange={handleChange}
        required
        className="w-full p-3 rounded-lg bg-linear-to-r from-[#11114471] to-[#111144de] border text-white
        focus:outline-none focus:ring-2 focus:ring-[#111144] shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] font-semibold"
      />
      {arrayerrors
        .filter((err) => err.path === "quantity")
        .map((err, index) => (
          <p
            key={index}
            className="text-red-500 font-bold text-center underline"
          >
            {err.msg}
          </p>
        ))}
      <input
        name="clientNotes"
        placeholder="ملاحظات إضافية (اختياري)"
        value={formData.clientNotes}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-linear-to-r from-[#11114471] to-[#111144de] border text-white
        focus:outline-none focus:ring-2 focus:ring-[#111144] shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] font-semibold"
      />
      <input
        name="departmentClient"
        placeholder="القسم / الجهة (اختياري)"
        value={formData.departmentClient}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-linear-to-r from-[#11114471] to-[#111144de] border text-white
        focus:outline-none focus:ring-2 focus:ring-[#111144] shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] font-semibold"
      />
      <input
        name="paperWeight"
        placeholder="وزن الورق (اختياري - مثال: 80 جم/م²)"
        value={formData.paperWeight}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-linear-to-r from-[#11114471] to-[#111144de] border text-white
        focus:outline-none focus:ring-2 focus:ring-[#111144] shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] font-semibold"
      />
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip,.rar,.txt"
        className="w-full p-3 rounded-lg bg-linear-to-r from-[#11114471] to-[#111144de] border text-[#111144] text-left direction-ltr
        focus:outline-none focus:ring-2 focus:ring-[#111144] shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] font-semibold"
      />
      <div className="w-full flex flex-col items-start gap-3">
        <span className="text-[#111144] font-semibold text-lg">
          خيارات الإنهاء:
        </span>
        <div className="flex flex-wrap gap-3 justify-center w-full">
          {orderTypes.finishingOptions.map((opt) => (
            <label
              key={opt}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all duration-200
          ${
            formData.finishingOptions.includes(opt)
              ? "bg-linear-to-r from-[#111144] to-[#111144a9] text-white shadow-[0_6px_12px_-6px_rgba(17,17,68,0.6)]"
              : "bg-[#1e1e3a] text-gray-300 border-[#11114480] hover:bg-[#252545] hover:text-white"
          }`}
            >
              <input
                type="checkbox"
                name="finishingOptions"
                value={opt}
                checked={formData.finishingOptions.includes(opt)}
                onChange={handleChange}
                className="w-4 h-4 text-[#111144] rounded focus:ring-[#111144] bg-white"
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-2xl font-bold bg-linear-to-r from-[#111144] to-[#111144a9] cursor-pointer active:scale-90 text-white
        hover:scale-105 transition transform duration-300 shadow-md ${
          loading ? "cursor-not-allowed opacity-70" : ""
        }`}
      >
        {loading ? "جاري التحميل ..." : "إرسال الطلب"}
      </button>
      {error && (
        <p className="text-red-500 font-semibold underline text-center">
          {error}
        </p>
      )}
    </form>
  );
};

export default CreateOrderForm;
