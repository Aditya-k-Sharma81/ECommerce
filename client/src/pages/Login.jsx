import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Login = ({ message }) => {
  const { setUser, setIsSeller, axios, navigate, fetchUser } = useAppContext();
  const [accountType, setAccountType] = useState("user"); // "user" or "seller"
  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (accountType === "user") {
        const { data } = await axios.post(`/api/user/${state}`, { name, email, password });
        if (data.success) {
          setUser(data.user);
          await fetchUser();
          toast.success(data.message || "Login Successful");
          navigate('/');
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post('/api/seller/login', { email, password });
        if (data.success) {
          setIsSeller(true);
          toast.success(data.message || "Seller Login Successful");
          navigate('/seller');
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (accountType === "seller") {
      setState("login");
    }
  }, [accountType]);

  return (
    <div className="flex items-center justify-center min-h-[80vh] text-sm text-gray-600">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[380px] rounded-xl shadow-2xl border border-gray-100 bg-white"
      >
        {/* Optional Auth Message */}
        {message && <p className="text-red-500 mb-2 text-center w-full bg-red-50 p-2 rounded-lg border border-red-100 font-medium animate-bounce">{message}</p>}

        {/* Toggle between User and Seller */}
        <div className="flex w-full bg-gray-100 rounded-lg p-1 mb-2">
          <button
            type="button"
            onClick={() => setAccountType("user")}
            className={`flex-1 py-2 rounded-md transition-all ${accountType === "user" ? "bg-white text-primary shadow-sm font-medium" : "text-gray-500"
              }`}
          >
            User
          </button>
          <button
            type="button"
            onClick={() => setAccountType("seller")}
            className={`flex-1 py-2 rounded-md transition-all ${accountType === "seller" ? "bg-white text-primary shadow-sm font-medium" : "text-gray-500"
              }`}
          >
            Seller
          </button>
        </div>

        {/* Heading */}
        <p className="text-2xl font-semibold m-auto">
          <span className="text-primary capitalize">{accountType}</span>{" "}
          {state === "login" ? "Login" : "Sign Up"}
        </p>

        {/* Name (User Register only) */}
        {accountType === "user" && state === "register" && (
          <div className="w-full">
            <p className="mb-1 font-medium">Name</p>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="Full Name"
              className="border border-gray-300 rounded-md w-full p-2.5 outline-primary focus:ring-1 focus:ring-primary transition-all"
              type="text"
              required
            />
          </div>
        )}

        {/* Email */}
        <div className="w-full">
          <p className="mb-1 font-medium">Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Email Address"
            className="border border-gray-300 rounded-md w-full p-2.5 outline-primary focus:ring-1 focus:ring-primary transition-all"
            type="email"
            required
          />
        </div>

        {/* Password */}
        <div className="w-full">
          <p className="mb-1 font-medium">Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Password"
            className="border border-gray-300 rounded-md w-full p-2.5 outline-primary focus:ring-1 focus:ring-primary transition-all"
            type="password"
            required
          />
        </div>

        {/* Toggle Text (User only) */}
        {accountType === "user" && (
          state === "register" ? (
            <p className="text-gray-500">
              Already have an account?{" "}
              <span onClick={() => setState("login")} className="text-primary cursor-pointer hover:underline font-medium">
                Login
              </span>
            </p>
          ) : (
            <p className="text-gray-500">
              New here?{" "}
              <span onClick={() => setState("register")} className="text-primary cursor-pointer hover:underline font-medium">
                Create an account
              </span>
            </p>
          )
        )}

        {/* Button */}
        <button
          type="submit"
          className="bg-primary hover:bg-primary-dull transition-all text-white w-full py-3 rounded-md cursor-pointer font-medium mt-2 shadow-lg shadow-primary/20 active:scale-[0.98]"
        >
          {state === "register" ? "Create Account" : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
