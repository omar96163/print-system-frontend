"use client";

import axios from "axios";
import { roles } from "../utils/roles";
import { useState, useEffect } from "react";
import { orderTypes } from "../utils/orderinfo";

const EditOrderForm = ({ orderId, currentOrder, onClose, onSuccess }) => {
  const role = localStorage.getItem("role");
  const isClient = role === roles.CLIENT;
  const isPrintEmployee = role === roles.PRINT_EMPLOYEE;
  const isAdmin = [roles.MANAGER, roles.DEPARTMENT_MANAGER].includes(role);

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

    // ✅ دالة ذكية للكشف عن التغييرات حسب الدور والحالة
    const hasChanges = () => {
      if (isClient) {
        if (currentOrder.status === orderTypes.status[0]) {
          // "قيد الانتظار": تحقق من كل الحقول القابلة للتعديل
          const fields = [
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
          for (const f of fields) {
            if (formData[f] !== (currentOrder[f] || "")) return true;
          }
          if (
            JSON.stringify(formData.finishingOptions.sort()) !==
            JSON.stringify((currentOrder.finishingOptions || []).sort())
          ) {
            return true;
          }
          if (files.length > 0) return true;
          return false;
        } else {
          // حالات تانية: فقط تغيير الحالة
          return formData.status !== (currentOrder.status || "");
        }
      } else if (isPrintEmployee) {
        return (
          formData.status !== (currentOrder.status || "") ||
          formData.departmentWork !== (currentOrder.departmentWork || "")
        );
      } else if (isAdmin) {
        return (
          formData.status !== (currentOrder.status || "") ||
          formData.totalPrice !== (currentOrder.totalPrice || "") ||
          formData.departmentWork !== (currentOrder.departmentWork || "") ||
          formData.departmentNotes?.trim() !== ""
        );
      }
      return false;
    };

    if (!hasChanges()) {
      setError("لم يتم تغيير أي بيانات");
      setLoading(false);
      return;
    }

    const bodyFormData = new FormData();

    // ✅ إرسال البيانات حسب الدور
    if (isClient) {
      if (currentOrder.status === orderTypes.status[0]) {
        // إرسال كل الحقول المسموح بها
        const allowedFields = [
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
        allowedFields.forEach((field) => {
          if (formData[field] !== (currentOrder[field] || "")) {
            bodyFormData.append(field, formData[field]);
          }
        });
        // finishingOptions
        if (
          JSON.stringify(formData.finishingOptions.sort()) !==
          JSON.stringify((currentOrder.finishingOptions || []).sort())
        ) {
          formData.finishingOptions.forEach((opt) =>
            bodyFormData.append("finishingOptions", opt)
          );
        }
      } else {
        if (formData.status !== currentOrder.status) {
          bodyFormData.append("status", formData.status);
        }
      }
    } else if (isPrintEmployee) {
      if (formData.status !== currentOrder.status)
        bodyFormData.append("status", formData.status);
      if (formData.departmentWork !== (currentOrder.departmentWork || ""))
        bodyFormData.append("departmentWork", formData.departmentWork);
    } else if (isAdmin) {
      if (formData.status !== currentOrder.status)
        bodyFormData.append("status", formData.status);
      if (formData.totalPrice !== (currentOrder.totalPrice || ""))
        bodyFormData.append("totalPrice", formData.totalPrice);
      if (formData.departmentWork !== (currentOrder.departmentWork || ""))
        bodyFormData.append("departmentWork", formData.departmentWork);
      if (formData.departmentNotes?.trim())
        bodyFormData.append("departmentNotes", formData.departmentNotes.trim());
    }

    // ✅ إرسال الملفات (للعميل فقط)
    if (isClient && files.length > 0) {
      files.forEach((file) => bodyFormData.append("orderFiles", file));
    }

    try {
      const token = localStorage.getItem("token");
      // ✅ إصلاح الرابط: إزالة المسافات
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
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      if (err.response) {
        const errors = err.response.data.message || "حدث خطأ";
        if (Array.isArray(errors)) {
          setArrayErrors(errors);
        } else {
          setError(errors);
        }
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

  // ✅ عرض الحقول حسب الدور والحالة
  const renderField = (
    name,
    value,
    type = "text",
    options = [],
    isCheckbox = false
  ) => {
    const isEditingAllowed = () => {
      if (isClient) {
        return currentOrder.status === orderTypes.status[0];
      }
      if (isPrintEmployee) {
        return name === "status" || name === "departmentWork";
      }
      if (isAdmin) {
        return ["status", "totalPrice", "departmentWork"].includes(name);
      }
      return false;
    };

    if (isCheckbox) {
      return options.map((opt) => (
        <label
          key={opt}
          className="flex items-center gap-2 bg-[#17174a]/50 px-3 py-1.5 rounded-lg border border-[#30307a] hover:bg-[#23235c] cursor-pointer transition"
        >
          <input
            type="checkbox"
            name={name}
            value={opt}
            checked={(formData[name] || []).includes(opt)}
            onChange={handleChange}
            disabled={!isEditingAllowed()}
            className="accent-[#40E0D0]"
          />
          <span className="text-gray-200 text-sm">{opt}</span>
        </label>
      ));
    }

    if (!isEditingAllowed()) {
      return (
        <div className="p-3 bg-[#1b1b4d]/70 rounded-xl text-gray-200 min-h-[40px]">
          {value || "—"}
        </div>
      );
    }

    if (type === "select") {
      return (
        <select
          name={name}
          value={value}
          onChange={handleChange}
          className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (type === "textarea") {
      return (
        <textarea
          name={name}
          value={value}
          onChange={handleChange}
          className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition"
          rows="2"
        />
      );
    }

    return (
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition placeholder-gray-400"
        placeholder={name === "paperWeight" ? "وزن الورق - مثال: 80 جم/م²" : ""}
      />
    );
  };

  return (
    <div className="rounded-3xl shadow-[0_0_40px_#0b0b2e] backdrop-blur-2xl bg-linear-to-br from-[#111144a9] via-[#16163fb4] to-[#0a0a22ab] text-gray-100 opacity-0 animate-[goDown_0.9s_ease_forwards] transition duration-300 mt-20 lg:w-[700px]">
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
                #{currentOrder.orderNumber}
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
                {isClient ? "تفاصيل الطلب" : "معلومات الطلب"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    الاسم
                  </label>
                  {renderField("clientName", formData.clientName)}
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
                  {renderField("contactInfo", formData.contactInfo)}
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
                  {renderField(
                    "printType",
                    formData.printType,
                    "select",
                    orderTypes.printType
                  )}
                  {getFieldError("printType") && (
                    <p className="mt-1 text-red-400 font-semibold text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
                      {getFieldError("printType")}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    نوع الورق
                  </label>
                  {renderField(
                    "paperType",
                    formData.paperType,
                    "select",
                    orderTypes.paperType
                  )}
                  {getFieldError("paperType") && (
                    <p className="mt-1 text-red-400 font-semibold text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
                      {getFieldError("paperType")}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    المقاس
                  </label>
                  {renderField(
                    "size",
                    formData.size,
                    "select",
                    orderTypes.size
                  )}
                  {getFieldError("size") && (
                    <p className="mt-1 text-red-400 font-semibold text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
                      {getFieldError("size")}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    الألوان
                  </label>
                  {renderField(
                    "colorOption",
                    formData.colorOption,
                    "select",
                    orderTypes.colorOption
                  )}
                  {getFieldError("colorOption") && (
                    <p className="mt-1 text-red-400 font-semibold text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
                      {getFieldError("colorOption")}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    وزن الورق
                  </label>
                  {renderField("paperWeight", formData.paperWeight)}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    وجه الطباعة
                  </label>
                  {renderField(
                    "sideOption",
                    formData.sideOption,
                    "select",
                    orderTypes.sideOption
                  )}
                  {getFieldError("sideOption") && (
                    <p className="mt-1 text-red-400 font-semibold text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
                      {getFieldError("sideOption")}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    الكمية
                  </label>
                  {renderField("quantity", formData.quantity, "number")}
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
                  {renderField("departmentClient", formData.departmentClient)}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  ملاحظات العميل
                </label>
                {renderField("clientNotes", formData.clientNotes, "textarea")}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  خيارات الإنهاء
                </label>
                <div className="flex flex-wrap gap-3">
                  {renderField(
                    "finishingOptions",
                    formData.finishingOptions,
                    "checkbox",
                    orderTypes.finishingOptions
                  )}
                </div>
                {getFieldError("finishingOptions") && (
                  <p className="mt-1 text-red-400 font-semibold text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
                    {getFieldError("finishingOptions")}
                  </p>
                )}
              </div>

              {/* رفع الملفات - للعميل فقط وفي حالة "قيد الانتظار" */}
              {isClient && currentOrder.status === orderTypes.status[0] && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    رفع الملفات
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="w-full p-3 bg-[#141440]/70 border border-[#30307a] rounded-xl text-gray-200 cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-[#40E0D0] file:text-[#0d0d26] hover:file:bg-[#2dd4bf] transition text-left direction-ltr"
                  />
                </div>
              )}

              {/* عرض الملفات المرفوعة */}
              {isClient && currentOrder.orderFiles?.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    الملفات المرفوعة
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {currentOrder.orderFiles.map((filePath, idx) => {
                      const fileName =
                        filePath.split("/").pop() || `ملف ${idx + 1}`;
                      return (
                        <a
                          key={idx}
                          href={`https://print-system-backend-production.up.railway.app/${filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#40E0D0] hover:underline text-sm bg-[#1b1b4d]/50 px-2 py-1 rounded"
                        >
                          {fileName}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* الحقول الإدارية */}
            {(isPrintEmployee || isAdmin) && (
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
                  {getFieldError("status") && (
                    <p className="mt-1 text-red-400 font-semibold text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
                      {getFieldError("status")}
                    </p>
                  )}
                </div>

                {(isPrintEmployee || isAdmin) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {isAdmin && (
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
                        {getFieldError("totalPrice") && (
                          <p className="mt-1 text-red-400 font-semibold text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
                            {getFieldError("totalPrice")}
                          </p>
                        )}
                      </div>
                    )}
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
                      {getFieldError("departmentWork") && (
                        <p className="mt-1 text-red-400 font-semibold text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
                          {getFieldError("departmentWork")}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {isAdmin && (
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
                )}
              </div>
            )}

            {/* حالة العميل: عرض الحالة فقط */}
            {isClient && !(isPrintEmployee || isAdmin) && (
              <div className="border-t border-white/10 pt-6 mt-6">
                <h3 className="font-bold text-lg mb-4 text-[#40E0D0]">
                  {currentOrder.status === orderTypes.status[0]
                    ? "إلغاء الطلب"
                    : "استرجاع أو إلغاء الطلب"}
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
                    {[orderTypes.status[0], orderTypes.status[5]].map(
                      (status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            )}

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
