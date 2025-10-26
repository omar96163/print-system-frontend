"use client";

import axios from "axios";
import { roles } from "../utils/roles";
import { useState, useEffect } from "react";
import { issueStatus } from "../utils/issueinfo";

const EditIssueForm = ({ issueId, currentIssue, onClose, onSuccess }) => {
  const userRole = localStorage.getItem("role");
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [arrayErrors, setArrayErrors] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contactInfo: "",
    status: "",
  });

  // تهيئة الحقول من الإبلاغ الحالي
  useEffect(() => {
    if (currentIssue) {
      setFormData({
        title: currentIssue.title || "",
        description: currentIssue.description || "",
        contactInfo: currentIssue.contactInfo || "",
        status: currentIssue.status || "",
      });
    }
  }, [currentIssue]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setArrayErrors((prev) => prev.filter((err) => err.path !== name));
    setError("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setArrayErrors([]);

    const allowedKeys = [roles.CLIENT, roles.PRINT_EMPLOYEE].includes(userRole)
      ? ["title", "description", "contactInfo", "status"]
      : ["status"];

    const bodyFormData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== "" && allowedKeys.includes(key)) {
        bodyFormData.append(key, formData[key]);
      }
    });

    if ([roles.CLIENT, roles.PRINT_EMPLOYEE].includes(userRole)) {
      files.forEach((file) => bodyFormData.append("issueFiles", file));
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `https://print-system-backend-production.up.railway.app/api/issues/${issueId}`,
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
      if (onSuccess) {
        await onSuccess();
      }
    } catch (err) {
      if (err.response) {
        console.log(err.response.data.error);
        const errors =
          err.response.data.error ||
          err.response.data.Error ||
          err.response.data.message ||
          "حدث خطأ";
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

  // دالة مساعدة لعرض أخطاء الحقول
  const getFieldError = (fieldName) => {
    return arrayErrors.find((err) => err.path === fieldName)?.msg || "";
  };

  return (
    <div
      className="rounded-3xl shadow-[0_0_40px_#0b0b2e] backdrop-blur-2xl bg-linear-to-br from-[#111144a9] via-[#16163fb4] to-[#0a0a22ab] text-gray-100 
      opacity-0 animate-[goDown_0.9s_ease_forwards] transition duration-300 mt-20 flex items-center justify-center"
    >
      <div className="rounded-3xl shadow-inner w-full max-w-3xl max-h-[92vh] overflow-y-auto">
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
          <div className="mb-10 flex justify-between items-center">
            <h2 className="text-xl md:text-4xl font-extrabold text-white tracking-wide drop-shadow-lg">
              تعديل الإبلاغ{" "}
              <span className="text-[#40E0D0]">
                # {currentIssue.IssueNumber}
              </span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-[#40E0D0] text-xl md:text-4xl transition transform hover:scale-110 cursor-pointer"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* الحقول الأساسية (يظهرها الكل، لكن الباك إند هيتحكم في الصلاحيات) */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                العنوان
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition placeholder-gray-400"
                disabled={
                  ![roles.CLIENT, roles.PRINT_EMPLOYEE].includes(userRole)
                }
              />
              {getFieldError("title") && (
                <p className="mt-1 text-red-400 font-semibold text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
                  {getFieldError("title")}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                الوصف
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition placeholder-gray-400"
                disabled={
                  ![roles.CLIENT, roles.PRINT_EMPLOYEE].includes(userRole)
                }
              />
              {getFieldError("description") && (
                <p className="mt-1 text-red-400 font-semibold text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
                  {getFieldError("description")}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                معلومات التواصل
              </label>
              <input
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleChange}
                className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition placeholder-gray-400"
                disabled={
                  ![roles.CLIENT, roles.PRINT_EMPLOYEE].includes(userRole)
                }
              />
              {getFieldError("contactInfo") && (
                <p className="mt-1 text-red-400 font-semibold text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
                  {getFieldError("contactInfo")}
                </p>
              )}
            </div>

            {/* الحالة */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                الحالة
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-3 bg-[#1b1b4d] border border-[#30307a] rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:outline-none transition placeholder-gray-400"
              >
                {userRole === roles.CLIENT ||
                userRole === roles.PRINT_EMPLOYEE ? (
                  <>
                    <option value={issueStatus.NEW}>جديدة</option>
                    <option value={issueStatus.DELETED}>ملغية</option>
                  </>
                ) : (
                  <>
                    <option value={issueStatus.NEW}>جديدة</option>
                    <option value={issueStatus.INPROGRESS}>جاري العمل</option>
                    <option value={issueStatus.FINISHED}>انتهت</option>
                  </>
                )}
              </select>
            </div>

            {/* رفع الملفات (للعميل/الموظف بس) */}
            {[roles.CLIENT, roles.PRINT_EMPLOYEE].includes(userRole) && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  الملفات الجديدة (اختياري)
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip,.rar,.txt"
                  className="w-full p-3 bg-[#141440]/70 border border-[#30307a] rounded-xl text-gray-200 cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-[#40E0D0] file:text-[#0d0d26] hover:file:bg-[#2dd4bf] transition text-left direction-ltr"
                />
              </div>
            )}

            {error && (
              <p className="text-red-400 font-semibold mb-8 text-center bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 flex-wrap mt-6">
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
                {loading ? "جاري التحديث ..." : "تحديث الإبلاغ"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditIssueForm;
