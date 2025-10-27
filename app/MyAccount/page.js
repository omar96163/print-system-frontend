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
import IssuesList from "../components/IssuesList";
import Logout from "../components/Logout";

const MyAccount = () => {
  const [user, setUser] = useState(null);
  const [error, seterror] = useState("");
  const [logout, setlogout] = useState(false);
  const [reports, setreports] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alluser, setalluser] = useState(false);
  const [allissue, setallissue] = useState(false);
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
    <section className="text-gray-800">
      {user && (
        <article className="flex flex-col items-center justify-center gap-5">
          <div className="flex flex-col items-center justify-center gap-5 bg-linear-to-b from-gray-300 to-gray-50 w-full p-5">
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

            <p className="opacity-0 animate-[goDown_1s_ease_forwards_.7s] transition duration-300 text-lg">
              الإسم »{" "}
              <strong className="text-[#111144] capitalize">{user.name}</strong>
            </p>
            <p className="opacity-0 animate-[goDown_1s_ease_forwards_.9s] transition duration-300">
              الدور »{" "}
              <strong className="text-[#111144] capitalize">{user.role}</strong>
            </p>
            <p className="opacity-0 animate-[goDown_1s_ease_forwards_1.1s] transition duration-300">
              البريد الإلكتروني »{" "}
              <strong className="direction-ltr inline-block text-[#111144]">
                {user.email}
              </strong>
            </p>

            <button
              onClick={() => setlogout(!logout)}
              className={`py-2 px-3 rounded-2xl font-bold bg-red-500 cursor-pointer active:scale-90 hover:scale-105 
              transition transform duration-300 shadow-md text-white opacity-0 animate-[goDown_1s_ease_forwards_1.3s] 
              ${logout ? "-translate-y-1.5" : ""}`}
            >
              تسجيل الخروج
            </button>

            {logout && <Logout onClose={() => setlogout(false)} />}
            <div
              className="flex flex-row flex-wrap items-center justify-center gap-5 opacity-0 animate-[goDown_1s_ease_forwards_1.6s] 
              transition duration-300 mt-5"
            >
              <button
                onClick={() => {
                  setIsEditing(!isEditing);
                  setgetOrdersByStatus(false);
                  setallissue(false);
                  setcreatissue(false);
                  setreports(false);
                  setcreatorder(false);
                  setallorders(false);
                  setalluser(false);
                }}
                className={`py-3 px-6 rounded-md font-bold bg-linear-to-r from-[#111144] to-[#111144a9] cursor-pointer active:scale-90 hover:scale-105 
                transition transform duration-300 shadow-md text-white ${
                  isEditing ? "translate-y-1.5" : ""
                }`}
              >
                {isEditing ? "إلغاء تعديل البيانات" : "تعديل البيانات الشخصية"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setallorders(!allorders);
                  setgetOrdersByStatus(false);
                  setreports(false);
                  setallissue(false);
                  setcreatissue(false);
                  setcreatorder(false);
                  setIsEditing(false);
                  setalluser(false);
                }}
                className={`py-3 px-6 rounded-md font-bold bg-linear-to-r from-[#111144] to-[#111144a9] cursor-pointer active:scale-90 hover:scale-105 
                transition transform duration-300 shadow-md text-white ${
                  allorders ? "translate-y-1.5" : ""
                }`}
              >
                {allorders ? "إخفاء جميع الطلبات" : "عرض جميع الطلبات"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setallissue(!allissue);
                  setalluser(false);
                  setreports(false);
                  setallorders(false);
                  setIsEditing(false);
                  setcreatorder(false);
                  setcreatissue(false);
                  setgetOrdersByStatus(false);
                }}
                className={`py-3 px-6 rounded-md font-bold bg-linear-to-r from-[#111144] to-[#111144a9] cursor-pointer active:scale-90 hover:scale-105 
                transition transform duration-300 shadow-md text-white ${
                  allissue ? "translate-y-1.5" : ""
                }`}
              >
                {allissue ? "إخفاء جميع الإبلاغات" : "عرض جميع الإبلاغات"}
              </button>
              {(user.role === roles.CLIENT ||
                user.role === roles.PRINT_EMPLOYEE) && (
                <button
                  type="button"
                  onClick={() => {
                    setcreatissue(!creatissue);
                    setgetOrdersByStatus(false);
                    setcreatorder(false);
                    setallissue(false);
                    setallorders(false);
                    setIsEditing(false);
                    setalluser(false);
                  }}
                  className={`py-3 px-6 rounded-md font-bold bg-linear-to-r from-[#111144] to-[#111144a9] cursor-pointer active:scale-90 hover:scale-105 
                  transition transform duration-300 shadow-md text-white ${
                    creatissue ? "translate-y-1.5" : ""
                  }`}
                >
                  {creatissue ? "إلغاء الإبلاغ" : "الدعم الفني"}
                </button>
              )}
              {user.role === roles.CLIENT && (
                <button
                  type="button"
                  onClick={() => {
                    setcreatorder(!creatorder);
                    setcreatissue(false);
                    setallissue(false);
                    setallorders(false);
                    setIsEditing(false);
                  }}
                  className={`py-3 px-6 rounded-md font-bold bg-linear-to-r from-[#111144] to-[#111144a9] cursor-pointer active:scale-90 hover:scale-105 
                  transition transform duration-300 shadow-md text-white ${
                    creatorder ? "translate-y-1.5" : ""
                  }`}
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
                    setallissue(false);
                    setcreatissue(false);
                    setgetOrdersByStatus(false);
                  }}
                  className={`py-3 px-6 rounded-md font-bold bg-linear-to-r from-[#111144] to-[#111144a9] cursor-pointer active:scale-90 hover:scale-105 
                  transition transform duration-300 shadow-md text-white ${
                    alluser ? "translate-y-1.5" : ""
                  }`}
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
                    setallissue(false);
                    setIsEditing(false);
                    setgetOrdersByStatus(false);
                  }}
                  className={`py-3 px-6 rounded-md font-bold bg-linear-to-r from-[#111144] to-[#111144a9] cursor-pointer active:scale-90 hover:scale-105 
                  transition transform duration-300 shadow-md text-white ${
                    reports ? "translate-y-1.5" : ""
                  }`}
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
                    setallissue(false);
                    setallorders(false);
                    setIsEditing(false);
                    setcreatissue(false);
                  }}
                  className={`py-3 px-6 rounded-md font-bold bg-linear-to-r from-[#111144] to-[#111144a9] cursor-pointer active:scale-90 hover:scale-105 
                  transition transform duration-300 shadow-md text-white ${
                    getOrdersByStatus ? "translate-y-1.5" : ""
                  }`}
                >
                  {getOrdersByStatus
                    ? "إخفاء الطلبات حسب الحالة"
                    : "عرض الطلبات حسب الحالة"}
                </button>
              )}
            </div>
          </div>

          {getOrdersByStatus && <OrdersByStatus />}

          {allissue && <IssuesList />}

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
        <p className="text-red-500 font-semibold underline text-center mt-20">
          {error}
        </p>
      )}
    </section>
  );
};

export default MyAccount;
