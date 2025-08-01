import React, { useContext, useState } from "react";
import bg from "../assets/authBg.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext.jsx";

import axios from "axios";

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { serverUrl, userData, setUserData } = useContext(UserDataContext);
  console.log("serverUrl is:", serverUrl);

  //fetching data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      let result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );
      setUserData(result.data);
      setLoading(false);
      navigate("/");
    } catch (error) {
      setUserData(null);
      console.error(
        error.response?.data?.message || "Signup failed",
        error.response?.status || error.message,
        setErr(error.response.data.message),
        setLoading(false)
      );
    }
  };

  return (
    <div
      className="w-full h-[100vh] bg-cover flex justify-center items-center"
      style={{ backgroundImage: `url(${bg}) ` }}
    >
      <form
        className=" w-[90%] h-[700px] max-w-[500px] bg-[#00000062] backdrop-blur-md shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px]"
        onSubmit={handleSignIn}
      >
        <h1 className="text-white text-[30px] font-semibold mb-[30px]">
          Sign In to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-[30px]">
            {" "}
            Virtual Assistant{" "}
          </span>
        </h1>

        <input
          id="email"
          name="email"
          type="email"
          placeholder=" Email "
          className="w-[25rem] h-[60px] outliner-none border-2 border-white bg-transparent text-white placeholder-gray-300   rounded-full text-[18px] px-[20px] py-[10px]"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="relative w-[25rem]">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder=" Enter Your Password"
            className="w-[25rem] h-[60px] outliner-none border-2 border-white bg-transparent text-white placeholder-gray-300  rounded-full text-[18px] px-[20px] py-[10px] pr-[50px]"
            required
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          {!showPassword && (
            <FontAwesomeIcon
              icon={faEye}
              className="absolute right-[20px] top-[20px]  text-white cursor-pointer "
              onClick={() => setShowPassword(true)}
            />
          )}
          {showPassword && (
            <FontAwesomeIcon
              icon={faEyeSlash}
              className="absolute right-[20px] top-[20px]  text-white cursor-pointer"
              onClick={() => setShowPassword(false)}
            />
          )}
        </div>
        {err.length > 0 && <p className="text-red-500">*{err}</p>}
        <button
          type="submit"
          className="min-w-[150px] h-[60px] text-black font-semibold text-[19px] bg-white rounded-full mt-[30px]"
          disabled={loading}
        >
          {loading ? "Loading..." : "Sign In"}
        </button>

        <p className="text-[white]">
          Want to create an account ?{" "}
          <span
            className="text-[18px] cursor-pointer text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>{" "}
        </p>
      </form>
    </div>
  );
}

export default SignIn;
