// src/components/ReportsPage.jsx
"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { orderTypes } from "../utils/orderinfo";

const ReportsPage = () => {
  // الفلاتر
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    type: "",
  });

  // الحالة
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // دالة تنسيق التاريخ
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-EG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  // دالة جلب التقرير
  const fetchReport = async () => {
    setLoading(true);
    setReport(null);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);
      if (filters.type) params.append("type", filters.type);

      const res = await axios.get(
        `https://print-system-backend-production.up.railway.app/api/orders/reports?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setReport(res.data.data);
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

  // دالة تحميل كـ CSV
  const downloadCSV = () => {
    if (!report?.orders?.length) return;

    const headers = [
      "رقم الطلب",
      "العميل",
      "الحالة",
      "النوع",
      "السعر",
      "التاريخ",
    ];
    const rows = report.orders.map((order) => [
      order.orderNumber,
      order.clientName,
      order.status,
      order.printType,
      order.totalPrice || "غير محدد",
      formatDate(order.createdAt),
    ]);

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "تقرير_الطلبات.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 opacity-0 animate-[goUp_1s_ease_forwards] transition duration-300">
      <h1 className="text-3xl font-bold text-center mb-8 text-[#111144]">
        تقارير الطلبات
      </h1>

      {/* فلاتر */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8 border-t-4 border-[#111144]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              من تاريخ
            </label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, from: e.target.value }))
              }
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              إلى تاريخ
            </label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, to: e.target.value }))
              }
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              نوع الطباعة
            </label>
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, type: e.target.value }))
              }
              className="w-full p-2 border rounded"
            >
              <option value="">الكل</option>
              {orderTypes.printType.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={fetchReport}
            disabled={loading}
            className="px-6 py-2 bg-[#111144] text-white rounded-lg hover:bg-[#1a1a44] disabled:opacity-70 cursor-pointer hover:scale-105 active:scale-95 transition duration-300"
          >
            {loading ? "جاري التحميل..." : "عرض التقرير"}
          </button>
        </div>
      </div>

      {/* رسالة خطأ */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6 text-center">
          {error}
        </div>
      )}

      {/* عرض التقرير */}
      {report && (
        <>
          {/* الإحصائيات */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <h2 className="text-xl font-bold mb-4 text-[#111144]">
              الإحصائيات
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(report.stats).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-[#f0f4ff] p-4 rounded-lg text-center border border-[#111144]/20"
                >
                  <p className="text-sm text-gray-600">{key}</p>
                  <p className="text-2xl font-bold text-[#111144]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* جدول الطلبات */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#111144]">الطلبات</h2>
              <button
                onClick={downloadCSV}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer hover:scale-105 active:scale-95 transition duration-300"
              >
                تحميل كـ CSV
              </button>
            </div>

            {/* ✅ استبدال الجدول بكروت */}
            {report.orders.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                لا توجد طلبات تطابق الفلاتر
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {report.orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-xl shadow-md p-5 border-l-4 border-[#111144] hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-gray-800">
                        طلب #{order.orderNumber}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.status === "جديدة"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "قيد المراجعة"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "قيد الطباعة"
                            ? "bg-purple-100 text-purple-800"
                            : order.status === "جاهزة للتسليم"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-semibold text-gray-800">
                          العميل:
                        </span>{" "}
                        {order.clientName}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-800">
                          النوع:
                        </span>{" "}
                        {order.printType}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-800">
                          السعر:
                        </span>{" "}
                        {order.totalPrice || "غير محدد"}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-800">
                          التاريخ:
                        </span>{" "}
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
