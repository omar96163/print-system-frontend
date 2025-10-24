"use client";
import axios from "axios";
import { roles } from "../utils/roles";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "../loading";

const UsersSection = ({ Role, User }) => {
  const [users, setusers] = useState([]);
  const [errors, seterrors] = useState("");
  const [loading, setloading] = useState(false);
  const router = useRouter();

  // 🟢 Fetch all users
  const fetchUsers = async () => {
    setloading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://print-system-backend-production.up.railway.app/api/users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setusers(res.data.data.users);
    } catch (err) {
      if (err.response) {
        seterrors(
          err.response.data.error || err.response.data.message || "حدث خطأ"
        );
      } else if (err.request) {
        seterrors("لا يوجد اتصال بالإنترنت");
      } else {
        seterrors("حدث خطأ غير متوقع");
      }
    } finally {
      setloading(false);
    }
  };

  // 🟡 Delete user
  const handleDelete = async (id) => {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذا المستخدم ؟");
    if (!confirmed) return;
    setloading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(
        `https://print-system-backend-production.up.railway.app/api/users/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (User && User._id === id) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        router.push("/");
        return;
      }

      setusers(users.filter((user) => user._id !== id));
    } catch (err) {
      console.log(err);
      if (err.response) {
        seterrors(
          err.response.data.error || err.response.data.message || "حدث خطأ"
        );
      } else if (err.request) {
        seterrors("لا يوجد اتصال بالإنترنت");
      } else {
        seterrors("حدث خطأ غير متوقع");
      }
    } finally {
      setloading(false);
    }
  };

  // 🔵 Update user role
  const handleRoleChange = async (id, newRole) => {
    const confirmed = window.confirm(
      "هل أنت متأكد من تغيير رول هذا المستخدم ؟"
    );
    if (!confirmed) return;
    setloading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `https://print-system-backend-production.up.railway.app/api/users/${id}`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setusers(users.map((u) => (u._id === id ? { ...u, role: newRole } : u)));
      alert(`تم تعديل الدور ليصبح ${newRole}`);
    } catch (err) {
      console.log(err);
      if (err.response) {
        seterrors(
          err.response.data.error || err.response.data.message || "حدث خطأ"
        );
      } else if (err.request) {
        seterrors("لا يوجد اتصال بالإنترنت");
      } else {
        seterrors("حدث خطأ غير متوقع");
      }
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto opacity-0 animate-[goUp_1s_ease_forwards] transition duration-300 mt-10">
      {errors && (
        <p className="text-red-500 font-semibold underline text-center">
          {errors}
        </p>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {users &&
          users.map((user) => (
            <div
              key={user._id}
              className={`bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition duration-300 border-t-4 ${
                user.role === roles.MANAGER
                  ? "border-[#40E0D0]"
                  : user.role === roles.DEPARTMENT_MANAGER
                  ? "border-[#E5C603]"
                  : user.role === roles.SUPPORT
                  ? "border-[#111144]"
                  : user.role === roles.PRINT_EMPLOYEE
                  ? "border-[#008080]"
                  : user.role === roles.CLIENT
                  ? "border-[#FFD1DC]"
                  : "border-gray-300"
              }`}
            >
              <div className="flex flex-row-reverse justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-sm text-gray-500 text-left direction-ltr">
                  {user.email}
                </p>
              </div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600 font-semibold">الدور:</p>
                <p
                  className={`font-semibold ${
                    user.role === roles.MANAGER
                      ? "text-[#40E0D0]"
                      : user.role === roles.DEPARTMENT_MANAGER
                      ? "text-[#E5C603]"
                      : user.role === roles.SUPPORT
                      ? "text-[#111144]"
                      : user.role === roles.PRINT_EMPLOYEE
                      ? "text-[#008080]"
                      : user.role === roles.CLIENT
                      ? "text-[#FFD1DC]"
                      : "text-gray-300"
                  }`}
                >
                  {user.role}
                </p>
              </div>
              {/* تعديل الدور */}
              {(Role === roles.MANAGER ||
                Role === roles.DEPARTMENT_MANAGER) && (
                <section>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 font-semibold mb-2">
                      تغيير الدور:
                    </label>
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user._id, e.target.value)
                      }
                      className="border border-gray-300 rounded-lg p-2 w-full text-sm cursor-pointer"
                    >
                      {Object.values(roles).map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* زر الحذف */}
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm w-full cursor-pointer"
                    >
                      حذف
                    </button>
                  </div>
                </section>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default UsersSection;
