import React, { useContext, useState } from "react";
import Card from "../components/Card";
import { BiImageAdd } from "react-icons/bi";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.jpg";
import image3 from "../assets/authBg.png";
import image4 from "../assets/image4.png";
import image5 from "../assets/image5.png";
import image6 from "../assets/image6.jpeg";
import image7 from "../assets/image7.jpeg";
import image8 from "../assets/artificial-intelligence.png";
import { useRef } from "react";
import { UserDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
export default function Customize() {
  const navigate = useNavigate();

  const {
    serverUrl,
    userData,
    setUserData,
    backendImage,
    setBackendImage,
    frontendImage,
    setFrontendImage,
    selectedImage,
    setSelectedImage,
  } = useContext(UserDataContext);

  const inputImage = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackendImage(file);
      setFrontendImage(URL.createObjectURL(file)); //sets the fronted image and creates an url link of the image file
    }
  };

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col p-[20px]">
      <MdOutlineKeyboardBackspace
        className="absolute cursor-pointer top-[30px] left-[30px] text-white w-[20px] h-[25px]"
        onClick={() => navigate("/")}
      />
      <div className="flex justify-center   ">
        <div>
          <img
            src={image8}
            alt="Artificial Intelligence Icon"
            className="w-[60px]"
          />
        </div>
        <h1 className="text-white text-[30px] text-center mb-[200px] ">
          Choose Your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            Virtual Assistant
          </span>
        </h1>
      </div>
      <div className="w-[90%] max-w-[900px]  flex justify-center items-center flex-wrap gap-[20px]">
        <Card image={image1} />
        <Card image={image2} />
        <Card image={image3} />
        <Card image={image4} />
        <Card image={image5} />
        <Card image={image6} />
        <Card image={image7} />
        <div
          className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] bg-[#020220] border-2 border-[#0000ff66] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 hover:border-4 hover:border-white flex items-center justify-center ${
            selectedImage == "input"
              ? "border-4 border-white shadow-2xl shadow-blue-950"
              : null
          }
          `}
          onClick={() => {
            inputImage.current.click();
            setSelectedImage("input");
          }}
        >
          {!frontendImage && (
            <BiImageAdd className="w-[25px] h-[25px] text-white  " />
          )}
          {frontendImage && (
            <img src={frontendImage} className="h-full object-cover" />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={inputImage}
          hidden
          onChange={handleImage}
        />
      </div>
      {selectedImage && (
        <button
          className="min-w-[150px] h-[60px] text-black font-semibold text-[19px] bg-white rounded-full mt-[30px] cursor-pointer"
          onClick={() => navigate("/customize2")}
        >
          Next
        </button>
      )}
    </div>
  );
}
