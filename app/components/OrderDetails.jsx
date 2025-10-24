"use client";

import axios from "axios";
import Loader from "../loading";
import { useEffect, useState } from "react";
import EditOrderForm from "./EditOrderForm";

const OrderDetails = ({ orderId }) => {
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);

  // دالة تنسيق التاريخ
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-EG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "هل أنت متأكد من حذف هذا الطلب ؟ لا يمكن التراجع عن هذه الخطوة"
      )
    ) {
      return;
    }
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(
        `https://print-system-backend-production.up.railway.app/api/orders/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(res.data.message);
      window.history.back();
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

  const fetchOrder = async () => {
    setLoading(true);
    setOrder(null);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://print-system-backend-production.up.railway.app/api/orders/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrder(res.data.data.order);
      setError("");
    } catch (err) {
      setOrder(null);
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

  useEffect(() => {
    fetchOrder();
  }, []);

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 text-center">
        <p className="text-red-500 font-semibold underline text-center">
          {error}
        </p>
        <button
          onClick={() => window.history.back()}
          className="py-3 px-6 rounded-2xl font-bold bg-linear-to-r from-[#111144] to-[#111144a9] cursor-pointer active:scale-90 hover:scale-105 
          transition transform duration-300 shadow-md text-white mt-5"
        >
          العودة للصفحة السابقة
        </button>
      </div>
    );
  }

  return (
    <div
      className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border-B-4 border-[#111144] opacity-0 animate-[goUp_1s_ease_forwards] 
      transition duration-300"
    >
      {showEditForm && (
        <div className="flex items-center justify-center mb-10">
          <EditOrderForm
            orderId={orderId}
            currentOrder={order}
            onClose={() => setShowEditForm(false)}
          />
        </div>
      )}

      <h1 className="text-3xl font-bold text-center mb-6 text-[#111144]">
        تفاصيل الطلب # {order.orderNumber}
      </h1>

      {/* معلومات العميل */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#f8f9ff] p-4 rounded-lg border-b-2 border-[#111144]">
          <h2 className="font-bold text-gray-800 mb-2">معلومات العميل</h2>
          <p className="text-[#111144bb]">
            <span className="font-semibold text-[#111144]">الإسم : </span>{" "}
            {order.clientName}
          </p>
          <p className="text-[#111144bb]">
            <span className="font-semibold text-[#111144]">التواصل : </span>{" "}
            {order.contactInfo}
          </p>
          {order.departmentClient && (
            <p className="text-[#111144bb]">
              <span className="font-semibold text-[#111144]">القسم : </span>
              {order.departmentClient}
            </p>
          )}
        </div>

        {/*تفاصيل الطلب*/}
        <div className="bg-[#f8f9ff] p-4 rounded-lg border-b-2 border-[#111144]">
          <h2 className="font-bold text-gray-800 mb-2">تفاصيل الطلب</h2>
          <p>
            <span className="font-semibold text-[#111144]">الحالة :</span>
            <span
              className={`px-2 py-1 rounded text-xs font-semibold mr-2 ${
                order.status === "قيد الانتظار"
                  ? "bg-yellow-100 text-yellow-800"
                  : order.status === "قيد الطباعة"
                  ? "bg-blue-100 text-blue-800"
                  : order.status === "منتهي"
                  ? "bg-green-100 text-green-800"
                  : order.status === "مرفوض"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {order.status}
            </span>
          </p>
          <p className="text-[#111144bb]">
            <span className="font-semibold text-[#111144]">التاريخ : </span>{" "}
            {formatDate(order.createdAt)}
          </p>
          <p className="text-[#111144bb]">
            <span className="font-semibold text-[#111144]">سعر الطلب : </span>{" "}
            {order.totalPrice || "غير محدد"}
          </p>
        </div>
      </div>

      {/* مواصفات الطباعة */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#111144] mb-4">
          مواصفات الطباعة
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-3 rounded text-center">
            <p className="text-xl font-semibold mb-2 text-[#111144]">النوع</p>
            <p className="text-sm text-[#111144bb]">{order.printType}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded text-center">
            <p className="text-xl font-semibold mb-2 text-[#111144]">الورق</p>
            <p className="text-sm text-[#111144bb]">{order.paperType}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded text-center">
            <p className="text-xl font-semibold mb-2 text-[#111144]">المقاس</p>
            <p className="text-sm text-[#111144bb]">{order.size}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded text-center">
            <p className="text-xl font-semibold mb-2 text-[#111144]">الكمية</p>
            <p className="text-sm text-[#111144bb]">{order.quantity}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded text-center">
            <p className="text-xl font-semibold mb-2 text-[#111144]">الألوان</p>
            <p className="text-sm text-[#111144bb]">{order.colorOption}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded text-center">
            <p className="text-xl font-semibold mb-2 text-[#111144]">الوجه</p>
            <p className="text-sm text-[#111144bb]">{order.sideOption}</p>
          </div>
          {order.paperWeight && (
            <div className="bg-gray-50 p-3 rounded text-center">
              <p className="text-xl font-semibold mb-2 text-[#111144]">
                وزن الورق
              </p>
              <p className="text-sm text-[#111144bb]">{order.paperWeight}</p>
            </div>
          )}
          {order.finishingOptions && order.finishingOptions.length > 0 && (
            <div className="bg-gray-50 p-3 rounded text-center">
              <p className="text-xl font-semibold mb-2 text-[#111144]">
                الإنهاء
              </p>
              <p className="text-sm text-[#111144bb]">
                {order.finishingOptions.join("، ")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* الملاحظات */}
      {(order.clientNotes || order.departmentNotes?.length > 0) && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#111144] mb-4">الملاحظات</h2>
          {order.clientNotes && (
            <div className="bg-blue-50 p-4 rounded mb-3">
              <p className="font-semibold text-blue-800">ملاحظات العميل:</p>
              <p className="text-blue-500">{order.clientNotes}</p>
            </div>
          )}
          {order.departmentNotes && order.departmentNotes.length > 0 && (
            <div className="bg-green-50 p-4 rounded">
              <p className="font-semibold text-green-800">ملاحظات القسم:</p>
              <ul className="list-disc pr-5 text-green-500">
                {order.departmentNotes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* الملفات المرفقة */}
      {order.orderFiles && order.orderFiles.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-[#111144] mb-4">
            الملفات المرفقة
          </h2>
          <div className="flex flex-wrap gap-3">
            {order.orderFiles.map((filename, index) => (
              <a
                key={index}
                href={`https://print-system-backend-production.up.railway.app/uploads/ordersfiles/${filename}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#111144] text-white rounded-lg hover:bg-[#1a1a44] transition flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                ملف {index + 1}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 text-center flex flex-row-reverse items-center justify-evenly">
        <button
          onClick={handleDelete}
          className="py-3 px-6 rounded-2xl font-bold bg-red-500 text-white cursor-pointer active:scale-90 hover:scale-105 
          transition transform duration-300 shadow-md flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          حذف الطلب
        </button>
        <button
          onClick={() => setShowEditForm(true)}
          className="py-3 px-6 rounded-2xl font-bold bg-blue-500 text-white cursor-pointer active:scale-90 hover:scale-105 
          transition transform duration-300 shadow-md flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          تعديل الطلب
        </button>
        <button
          onClick={() => window.history.back()}
          className="py-3 px-6 rounded-2xl font-bold bg-linear-to-r from-[#111144] to-[#111144a9] cursor-pointer active:scale-90 hover:scale-105 
          transition transform duration-300 shadow-md text-white"
        >
          العودة للطلبات
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;
