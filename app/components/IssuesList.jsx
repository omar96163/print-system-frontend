"use client";

import axios from "axios";
import Link from "next/link";
import Loader from "../loading";
import { issueStatus } from "../utils/issueinfo";
import React, { useEffect, useState } from "react";

const IssuesList = () => {
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchIssues = async () => {
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://print-system-backend-production.up.railway.app/api/issues",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setIssues(res.data.data.issues);
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
    fetchIssues();
  }, []);

  return (
    <div
      className="rounded-3xl shadow-[0_0_40px_#0b0b2e] backdrop-blur-2xl 
      bg-linear-to-b from-[#111144c2] to-[#0a0a228c] text-gray-100 
      opacity-0 animate-[goUp_0.9s_ease_forwards] transition duration-300 p-10 mt-10 md:w-[800px]"
    >
      <h2 className="font-extrabold text-3xl text-[#40E0D0] text-center mb-6">
        قائمة البلاغات
      </h2>

      {loading && <Loader />}

      {error && !loading && (
        <p className="text-center text-red-400 bg-red-900/30 border border-red-700/30 rounded-lg py-3 shadow-md">
          {error}
        </p>
      )}

      {!loading && !error && issues.length > 0 && (
        <div className="space-y-5">
          {issues.map((issue) => (
            <Link
              key={issue._id}
              href={`/issue/${issue._id}`}
              className="block"
            >
              <div className="bg-[#1b1b4d]/60 border border-[#30307a] rounded-2xl p-5 hover:scale-[1.01] transition duration-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold text-[#40E0D0]">
                    {issue.title}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      issue.status === issueStatus.NEW
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : issue.status === issueStatus.INPROGRESS
                        ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                        : issue.status === issueStatus.FINISHED
                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                        : "bg-red-500/20 text-red-300 border border-red-500/30"
                    }`}
                  >
                    {issue.status}
                  </span>
                </div>

                <p className="text-gray-300 mb-3 leading-relaxed">
                  {issue.description}
                </p>

                <div className="text-sm text-gray-400 space-y-1">
                  <p>
                    رقم الإبلاغ :{" "}
                    <strong className="text-[#40E0D0]">
                      {issue.IssueNumber}
                    </strong>
                  </p>
                  <p>
                    <strong>معلومات التواصل : </strong> {issue.contactInfo}
                  </p>
                  <p>
                    <strong>تاريخ الإرسال : </strong>{" "}
                    {new Date(issue.createdAt).toLocaleString("ar-EG")}
                  </p>
                  {issue.issueFiles.length > 0 && (
                    <div className="mt-2">
                      <strong>الملفات المرفقة : </strong>
                      {issue.issueFiles && issue.issueFiles.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <p className="text-xs text-gray-400">
                            الملفات المرفقة: {issue.issueFiles.length}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default IssuesList;
