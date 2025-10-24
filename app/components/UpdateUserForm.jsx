"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { roles } from "../utils/roles";

const UpdateUserForm = ({ UserData, onUpdateSuccess }) => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    password: "",
    name: UserData?.name || "",
    email: UserData?.email || "",
    role: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);

  const [preview, setPreview] = useState(
    UserData?.avatar && UserData.avatar !== "default"
      ? `https://print-system-backend-production.up.railway.app/uploads/images/${UserData.avatar}`
      : "/شعار-الجامعة.png"
  );

  const [errors, setErrors] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      const form = new FormData();

      // إضافة الحقول فقط إذا تم تعديلها
      if (formData.name && formData.name !== UserData.name) {
        form.append("name", formData.name);
      }

      if (formData.email && formData.email !== UserData.email) {
        form.append("email", formData.email);
      }

      if (formData.password && formData.password.trim() !== "") {
        form.append("password", formData.password);
      }

      // إضافة الدور للمدير فقط إذا تم تعديله
      if (
        (UserData.role === roles.MANAGER ||
          UserData.role === roles.DEPARTMENT_MANAGER) &&
        formData.role &&
        formData.role.trim() !== ""
      ) {
        form.append("role", formData.role);
      }

      // إضافة الصورة إذا تم اختيار صورة جديدة
      if (avatarFile) {
        form.append("avatar", avatarFile);
      }

      // التحقق من وجود بيانات للإرسال
      if ([...form.entries()].length === 0) {
        setErrorMsg("لم يتم تعديل أي بيانات");
        setLoading(false);
        return;
      }

      const res = await axios.patch(
        `https://print-system-backend-production.up.railway.app/api/users/${UserData._id}`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = res.data.data.updatedUser;
      console.log(updatedUser);

      // تحديث localStorage
      localStorage.setItem("name", updatedUser.name);
      if (updatedUser.role) {
        localStorage.setItem("role", updatedUser.role);
      }

      if (onUpdateSuccess) {
        onUpdateSuccess(updatedUser);
      } else {
        router.push("/MyAccount");
        router.refresh();
      }
    } catch (err) {
      const status = err.response?.status;
      const apiError = err.response?.data?.message;
      console.log("Error:", apiError);

      if (status === 400 || status === 403 || status === 500) {
        if (Array.isArray(apiError)) {
          setErrors(apiError);
        } else {
          setErrorMsg(apiError);
        }
      } else {
        setErrorMsg("حدث خطأ غير متوقع");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-8 items-center justify-center rounded-3xl w-[500px] px-8 py-16 shadow-md hover:shadow-2xl
      opacity-0 animate-[goUp_1s_ease_forwards] transition duration-300 border-t-4 border-[#111144] mt-10"
    >
      <h2 className="font-extrabold text-3xl text-[#111144e3] animate-[color_2s_ease_infinite_alternate_1s]">
        تعديل البيانات الشخصية
      </h2>

      {/* الصورة الشخصية */}
      <div className="w-full flex items-center justify-center">
        <label
          className="w-52 h-52 flex items-center justify-center rounded-full bg-linear-to-r from-[#111144] to-[#111144a9] overflow-hidden 
          shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] cursor-pointer transition duration-300 ring-4 hover:ring-[#111144c9] text-white"
        >
          <img
            src={preview}
            alt="avatar preview"
            className="w-full h-full object-cover"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* الاسم */}
      <div className="w-full">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="الاسم"
          className="w-full p-3 rounded-lg bg-linear-to-r from-[#11114471] to-[#111144de] border placeholder-white text-left text-white
          focus:outline-none focus:ring-2 focus:ring-[#111144] shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] font-semibold direction-ltr"
        />
        {errors
          .filter((err) => err.path === "name")
          .map((err, i) => (
            <p
              key={i}
              className="text-red-500 font-bold mt-3 text-center underline"
            >
              {err.msg}
            </p>
          ))}
      </div>

      {/* البريد الإلكتروني */}
      <div className="w-full">
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="البريد الإلكتروني"
          className="w-full p-3 rounded-lg bg-linear-to-r from-[#11114471] to-[#111144de] border placeholder-white text-left text-white
          focus:outline-none focus:ring-2 focus:ring-[#111144] shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] font-semibold direction-ltr"
        />
        {errors
          .filter((err) => err.path === "email")
          .map((err, i) => (
            <p
              key={i}
              className="text-red-500 font-bold mt-3 text-center underline"
            >
              {err.msg}
            </p>
          ))}
      </div>

      {/* كلمة المرور */}
      <div className="w-full">
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="كلمة المرور الجديدة (اختياري)"
          className="w-full p-3 rounded-lg bg-linear-to-r from-[#11114471] to-[#111144de] border placeholder-white text-left text-white
          focus:outline-none focus:ring-2 focus:ring-[#111144] shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] font-semibold direction-ltr"
        />
        {errors
          .filter((err) => err.path === "password")
          .map((err, i) => (
            <p
              key={i}
              className="text-red-500 font-bold mt-3 text-center underline"
            >
              {err.msg}
            </p>
          ))}
      </div>

      {/* الدور (للمدير فقط) */}
      {(UserData.role === roles.MANAGER ||
        UserData.role === roles.DEPARTMENT_MANAGER) && (
        <div className="w-full">
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-linear-to-r from-[#11114471] to-[#111144de] border text-white
            focus:outline-none focus:ring-2 focus:ring-[#111144] shadow-[0_10px_15px_-8px_rgba(0,0,0,0.7)] font-semibold"
          >
            <option value="">اختر دور جديد (اختياري)</option>
            <option value={roles.CLIENT}>عميل</option>
            <option value={roles.SUPPORT}>دعم فني</option>
            <option value={roles.PRINT_EMPLOYEE}>موظف طباعة</option>
            <option value={roles.DEPARTMENT_MANAGER}>مدير قسم</option>
            <option value={roles.MANAGER}>مدير</option>
          </select>
          {errors
            .filter((err) => err.path === "role")
            .map((err, i) => (
              <p
                key={i}
                className="text-red-500 font-bold mt-3 text-center underline"
              >
                {err.msg}
              </p>
            ))}
        </div>
      )}

      {/* الزر */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-2xl font-bold bg-linear-to-r from-[#111144] to-[#111144a9] cursor-pointer active:scale-90 hover:scale-105 transition 
        transform duration-300 shadow-md text-white ${
          loading ? "cursor-not-allowed opacity-70" : ""
        }`}
      >
        {loading ? "جاري التحميل..." : "تحديث البيانات"}
      </button>

      {errorMsg && (
        <p className="text-red-500 font-semibold underline">{errorMsg}</p>
      )}
    </form>
  );
};

export default UpdateUserForm;
