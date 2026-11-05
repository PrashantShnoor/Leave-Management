import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../utils/constants";


const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password_hash: ""
  });

  const handleChange = (e) => {
    setError("");

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/login`,
        formData,
        {
          withCredentials: true
        }
      );

const user = response.data.data;

sessionStorage.setItem("user", JSON.stringify(user));

const role = user.role?.toLowerCase();

switch (role) {
  case "admin":
    navigate("/admin/dashboard", { replace: true });
    break;

  case "manager":
    navigate("/manager/dashboard", { replace: true });
    break;

  case "hr":
    navigate("/hr/dashboard", { replace: true });
    break;

  case "employee":
    navigate("/employee/dashboard", { replace: true });
    break;

  default:
    sessionStorage.removeItem("user");
    setError("Your account has an invalid role. Contact administrator.");
}

    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFF6EF] flex items-center justify-center p-5">

      <div className="w-full max-w-md">

        <div className="text-center mb-7">
          <p className="text-sm text-[#78917D] mt-1">
            Employee Leave Management Portal
          </p>
        </div>

        <div className="bg-white border border-[#DCE9DC] rounded-2xl shadow-[0_12px_40px_rgba(39,80,48,0.08)] p-7 sm:p-9">

          <div className="mb-7">
            <h2 className="text-3xl font-bold text-[#244D35]"> Sign In </h2>
            <p className="text-[#819285] mt-2 text-sm">
              Login to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-semibold text-[#3B5541] mb-2"> Email address </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="input input-bordered w-full bg-white border-[#D7E5D8] text-[#244D35] placeholder:text-[#A0ADA1] focus:outline-none focus:border-[#6B9B73]"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#3B5541] mb-2">
                Password
              </label>

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  name="password_hash"
                  placeholder="Enter your password"
                  value={formData.password_hash}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-white border-[#D7E5D8] text-[#244D35] placeholder:text-[#A0ADA1] pr-16 focus:outline-none focus:border-[#6B9B73]"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#829486] hover:text-[#39734B]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>
            </div>

            <div className="flex justify-end -mt-1">
              <button
                type="button"
                className="text-sm font-medium text-[#39734B]
                           hover:text-[#244D35] transition-colors"
                onClick={() => {
                  // to Add forgot password functionality later.
                }}
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200
                              text-red-600 text-sm rounded-lg p-3">
                <i className="fa-solid fa-circle-exclamation mr-2"></i>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn w-full h-12 min-h-12 border-none rounded-xl bg-[#39734B] hover:bg-[#2D603D] text-white text-base font-semibold
                         shadow-md shadow-[#39734B]/15
                         transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <span className="ml-2">→</span>
                </>
              )}
            </button>

          </form>

        </div>

        <p className="text-center text-xs text-[#91A394] mt-6">
          © 2026 LeaveFlow. All rights reserved.
        </p>

      </div>
    </div>
  );
};

export default Login;
