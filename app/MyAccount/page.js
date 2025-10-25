"use client";
import axios from "axios";
import Image from "next/image";
import Loader from "../loading";
import { roles } from "../utils/roles";
import { useState, useEffect } from "react";
import OrdersList from "../components/OrdersList";
import ReportsPage from "../components/ReportsPage";
import UsersSection from "../components/UsersSection.jsx";
import UpdateUserForm from "../components/UpdateUserForm.jsx";
import OrdersByStatus from "../components/OrdersByStatus.jsx";
import CreateIssueForm from "../components/CreateIssueForm.jsx";
import CreateOrderForm from "../components/CreateOrderForm.jsx";

const MyAccount = () => {
  const [user, setUser] = useState(null);
  const [error, seterror] = useState("");
  const [reports, setreports] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alluser, setalluser] = useState(false);
  const [allorders, setallorders] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [creatorder, setcreatorder] = useState(false);
  const [creatissue, setcreatissue] = useState(false);
  const [getOrdersByStatus, setgetOrdersByStatus] = useState(false);

  const fetchMyAccount = async () => {
    setLoading(true);
    seterror("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://print-system-backend-production.up.railway.app/api/users/myAccount",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser(res.data.data.myAccount);
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

  useEffect(() => {
    fetchMyAccount();
  }, []);

  if (loading && !user) {
    return <Loader />;
  }

  return (
    <section className="p-8 text-gray-800">
      {user && (
        <article className="mt-4 flex flex-col items-center justify-center gap-5">
          <Image
            src={
              user.avatar === "default"
                ? "/شعار-الجامعة.png"
                : `https://print-system-backend-production.up.railway.app/uploads/images/${user.avatar}`
            }
            alt="avatar"
            width={128}
            height={128}
            className="w-32 h-32 rounded-full mt-4 object-contain opacity-0 animate-[goDown_1s_ease_forwards_.4s] transition duration-300"
          />

          <p className="opacity-0 animate-[goDown_1s_ease_forwards_.7s] transition duration-300">
            الإسم : {user.name}
          </p>
          <p className="opacity-0 animate-[goDown_1s_ease_forwards_.9s] transition duration-300">
            الدور : {user.role}
          </p>
          <p className="opacity-0 animate-[goDown_1s_ease_forwards_1.1s] transition duration-300">
            البريد الإلكتروني :{" "}
            <strong className="direction-ltr inline-block">{user.email}</strong>
          </p>

          <div className="flex flex-row flex-wrap gap-5 opacity-0 animate-[goDown_1s_ease_forwards_1.3s] transition duration-300">
            <button
              onClick={() => {
                setIsEditing(!isEditing);
                setgetOrdersByStatus(false);
                setcreatissue(false);
                setreports(false);
                setcreatorder(false);
                setallorders(false);
                setalluser(false);
              }}
              className="py-3 px-6 rounded-2xl font-bold bg-linear-to-r from-[#111144] to-[#111144a9] cursor-pointer active:scale-90 hover:scale-105 
              transition transform duration-300 shadow-md text-white"
            >
              {isEditing ? "إلغاء تعديل البيانات" : "تعديل البيانات الشخصية"}
            </button>
            <button
              type="button"
              onClick={() => {
                setallorders(!allorders);
                setgetOrdersByStatus(false);
                setreports(false);
                setcreatissue(false);
                setcreatorder(false);
                setIsEditing(false);
                setalluser(false);
              }}
              className="py-3 px-6 rounded-2xl font-bold bg-linear-to-r from-[#111144] to-[#111144a9] cursor-pointer active:scale-90 hover:scale-105 
                transition transform duration-300 shadow-md text-white"
            >
              {allorders ? "إخفاء جميع الطلبات" : "عرض جميع الطلبات"}
            </button>
            {(user.role === roles.CLIENT || user.role === roles.SUPPORT) && (
              <button
                type="button"
                onClick={() => {
                  setcreatissue(!creatissue);
                  setcreatorder(false);
                  setallorders(false);
                  setIsEditing(false);
                }}
                className="py-3 px-6 rounded-2xl font-bold bg-linear-to-r from-[#111144] to-[#111144a9] text-white
                cursor-pointer active:scale-90 hover:scale-105 transition transform duration-300 shadow-md"
              >
                {creatissue ? "إلغاء الإبلاغ" : "إبلاغ عن مشكلة"}
              </button>
            )}
            {user.role === roles.CLIENT && (
              <button
                type="button"
                onClick={() => {
                  setcreatorder(!creatorder);
                  setcreatissue(false);
                  setallorders(false);
                  setIsEditing(false);
                }}
                className="py-3 px-6 rounded-2xl font-bold bg-linear-to-r from-[#111144] to-[#111144a9] cursor-pointer active:scale-90 hover:scale-105 
                    transition transform duration-300 shadow-md text-white"
              >
                {creatorder ? "إلغاء الطلب" : "إنشاء طلب"}
              </button>
            )}
            {(user.role === roles.MANAGER ||
              user.role === roles.DEPARTMENT_MANAGER ||
              user.role === roles.SUPPORT) && (
              <button
                type="button"
                onClick={() => {
                  setalluser(!alluser);
                  setreports(false);
                  setallorders(false);
                  setIsEditing(false);
                  setcreatissue(false);
                  setgetOrdersByStatus(false);
                }}
                className="py-3 px-6 rounded-2xl font-bold bg-linear-to-r from-[#111144] to-[#111144a9] cursor-pointer active:scale-90 hover:scale-105 
                  transition transform duration-300 shadow-md text-white"
              >
                {alluser ? "إخفاء المستخدمين 👥" : "عرض المستخدمين 👥"}
              </button>
            )}
            {(user.role === roles.MANAGER ||
              user.role === roles.DEPARTMENT_MANAGER) && (
              <button
                onClick={() => {
                  setreports(!reports);
                  setalluser(false);
                  setallorders(false);
                  setIsEditing(false);
                  setgetOrdersByStatus(false);
                }}
                className="py-3 px-6 rounded-2xl font-bold bg-linear-to-r from-[#111144] to-[#111144a9] cursor-pointer active:scale-90 hover:scale-105 
                    transition transform duration-300 shadow-md text-white"
              >
                {reports ? "إخفاء التقارير" : "إنشاء التقارير"}
              </button>
            )}
            {(user.role === roles.MANAGER ||
              user.role === roles.DEPARTMENT_MANAGER ||
              user.role === roles.SUPPORT) && (
              <button
                onClick={() => {
                  setgetOrdersByStatus(!getOrdersByStatus);
                  setreports(false);
                  setalluser(false);
                  setallorders(false);
                  setIsEditing(false);
                  setcreatissue(false);
                }}
                className="py-3 px-6 rounded-2xl font-bold bg-linear-to-r from-[#111144] to-[#111144a9] cursor-pointer active:scale-90 hover:scale-105 
                    transition transform duration-300 shadow-md text-white "
              >
                {getOrdersByStatus
                  ? "إخفاء الطلبات حسب الحالة"
                  : "عرض الطلبات حسب الحالة"}
              </button>
            )}
          </div>

          {getOrdersByStatus && <OrdersByStatus />}

          {reports && <ReportsPage />}

          {creatissue && <CreateIssueForm />}

          {allorders && <OrdersList />}

          {isEditing && (
            <UpdateUserForm
              UserData={user}
              onUpdateSuccess={(updatedUser) => {
                setUser(updatedUser);
                setIsEditing(false);
              }}
            />
          )}

          {creatorder && <CreateOrderForm />}

          {alluser && <UsersSection Role={user.role} User={user} />}
        </article>
      )}
      {error && (
        <p className="text-red-500 font-semibold underline text-center">
          {error}
        </p>
      )}
    </section>
  );
};

export default MyAccount;
