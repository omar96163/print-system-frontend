import axios from "axios";
import Link from "next/link";
import Loader from "../loading";
import React, { useState, useEffect } from "react";

const OrdersList = () => {
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://print-system-backend-production.up.railway.app/api/orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOrders(res.data.data.orders);
        setError("");
      } catch (err) {
        setOrders([]);
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

    fetchOrders();
  }, []);

  // دالة لتحويل التاريخ لشكل مقروء
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

  if (loading) return <Loader />;

  return (
    <div className="w-full max-w-6xl mx-auto opacity-0 animate-[goUp_1s_ease_forwards] transition duration-300 mt-10">
      {error && (
        <p className="text-red-500 font-semibold underline text-center">
          {error}
        </p>
      )}
      {orders.map((order) => (
        <Link key={order._id} href={`/order/${order._id}`} className="block">
          <div
            className={`bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition duration-300 border-t-4 cursor-pointer mb-5 ${
              order.status === "قيد الانتظار"
                ? "border-yellow-500"
                : order.status === "قيد الطباعة"
                ? "border-blue-500"
                : order.status === "منتهي"
                ? "border-green-500"
                : order.status === "مرفوض"
                ? "border-red-500"
                : "border-gray-300"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                طلب #{order.orderNumber}
              </h3>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
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
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-semibold text-gray-800">النوع:</span>{" "}
                {order.printType}
              </p>
              <p>
                <span className="font-semibold text-gray-800">الورق:</span>{" "}
                {order.paperType} - {order.size}
              </p>
              <p>
                <span className="font-semibold text-gray-800">الكمية:</span>{" "}
                {order.quantity}
              </p>
              <p>
                <span className="font-semibold text-gray-800">التاريخ:</span>{" "}
                {formatDate(order.createdAt)}
              </p>
              {order.clientNotes && (
                <p>
                  <span className="font-semibold text-gray-800">ملاحظات:</span>{" "}
                  {order.clientNotes}
                </p>
              )}
            </div>

            {order.orderFiles && order.orderFiles.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  الملفات المرفقة: {order.orderFiles.length}
                </p>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default OrdersList;
