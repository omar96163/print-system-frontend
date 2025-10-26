"use client";

import axios from "axios";
import { issueStatus } from "../utils/issueinfo";
import React, { useEffect, useState } from "react";
import Loader from "../loading";

const IssueDetails = ({ issueId }) => {
  const [error, setError] = useState("");
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchIssue = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://print-system-backend-production.up.railway.app/api/issues/${issueId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIssue(res.data.data.issue);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 404) {
          setError(err.response.data.message);
        } else if (err.response.status === 500) {
          setError("حدث خطأ في السيرفر أثناء جلب البلاغات ❌");
        } else {
          setError("حدث خطأ غير متوقع");
        }
      } else if (err.request) {
        setError("لا يوجد اتصال بالإنترنت");
      } else {
        setError("فشل غير متوقع أثناء معالجة الطلب");
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchIssue();
  }, [issueId]);

  return (
    <div
      className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border-t-4 border-[#111144] opacity-0 animate-[goUp_1s_ease_forwards] 
      transition duration-300"
    >
      {loading && <Loader />}

      {error && !loading && (
        <p className="text-center text-red-400 bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
          {error}
        </p>
      )}

      {!loading && !error && issue && (
        <div className="space-y-3 text-gray-700 text-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            الإبلاغ رقم #{issue.IssueNumber}
          </h2>
          <p>
            <span className="font-semibold">العنوان : </span> {issue.title}
          </p>
          <p>
            <span className="font-semibold">الوصف : </span> {issue.description}
          </p>
          <p>
            <span className="font-semibold">حالة الإبلاغ : </span>{" "}
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                issue.status === issueStatus.NEW
                  ? "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                  : issue.status === issueStatus.INPROGRESS
                  ? "bg-yellow-500/20 text-yellow-600 border border-yellow-500/30"
                  : issue.status === issueStatus.FINISHED
                  ? "bg-green-500/20 text-green-600 border border-green-500/30"
                  : "bg-red-500/20 text-red-600 border border-red-500/30"
              }`}
            >
              {issue.status}
            </span>
          </p>
          <p>
            <span className="font-semibold">رقم التواصل : </span>{" "}
            {issue.contactInfo}
          </p>
          <p>
            <span className="font-semibold">تاريخ الإبلاغ : </span>{" "}
            {new Date(issue.createdAt).toLocaleString("ar-EG")}
          </p>
          {issue.issueFiles && issue.issueFiles.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-bold text-[#111144] mb-4">
                الملفات المرفقة
              </h2>
              <div className="flex flex-wrap gap-3">
                {issue.issueFiles.map((filename, index) => (
                  <a
                    key={index}
                    href={`https://print-system-backend-production.up.railway.app/uploads/issuesfiles/${filename}`}
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
          <div className="mt-8 text-center flex flex-row-reverse items-center justify-start gap-5">
            <button
              onClick={() => window.history.back()}
              className="py-3 px-6 rounded-2xl font-bold bg-linear-to-r from-[#111144] to-[#111144a9] cursor-pointer active:scale-90 hover:scale-105 
            transition transform duration-300 shadow-md text-white text-left"
            >
              العودة للطلبات
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueDetails;
