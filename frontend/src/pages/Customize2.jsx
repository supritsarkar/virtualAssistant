import React, { useContext, useState } from "react";
import image8 from "../assets/artificial-intelligence.png";
import { UserDataContext } from "../context/UserContext";
import axios from "axios";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { useNavigate } from 'react-router-dom';


export default function Customize2() {
  const navigate = useNavigate()
  const[loading,setLoading] = useState(false);
  const { userData, backendImage, selectedImage, serverUrl, setUserData } =
    useContext(UserDataContext);
  const [assistantName, setAssistantName] = useState(
    userData?.assistantName || ""
  );

  const handleUpdateAssistant = async () => {
    setLoading(true)
    try {
      let formdata = new FormData();
      formdata.append("assistantName", assistantName);
      if (backendImage) {
        formdata.append("assistantImage", backendImage);
      } else {
        formdata.append("imageUrl", selectedImage);
      }
      const result = await axios.post(
        `${serverUrl}/api/user/update`,
        formdata,
        { withCredentials: true }
      );
      setLoading(false)
      console.log(result.data);
      setUserData(result.data);
      navigate("/")
    } catch (error) {
      setLoading(false)
      console.log(error);
    }
  };

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col p-[20px] relative">
      <MdOutlineKeyboardBackspace className='absolute cursor-pointer top-[30px] left-[30px] text-white w-[20px] h-[25px]' onClick={()=>navigate("/customize")}/>
      <div className="flex flex-row items-center justify-center gap-4 mb-[50px]">
        <img
          src={image8}
          alt="Artificial Intelligence Icon"
          className="w-[60px] "
        />
        <h1 className="text-white text-[30px] text-center  ">
          Enter Your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            Assistant
          </span>{" "}
          Name
        </h1>
      </div>

      <input
        name="text"
        type="email"
        placeholder=" eg: Shifra "
        className="w-full max-w-[600px] h-[60px] outliner-none border-2 border-white bg-transparent text-white placeholder-gray-300   rounded-full text-[18px] px-[20px] py-[10px] mb-[100px]"
        required
        onChange={(e) => {
          setAssistantName(e.target.value);
          console.log(assistantName);
        }}
        value={assistantName}
      />
      {assistantName && (
        <button
          className="min-w-[150px] h-[60px] text-black font-semibold text-[19px] bg-white rounded-full cursor-pointer "
          disabled={loading }
          onClick={() => {
            handleUpdateAssistant();
          }}
        >
         { !loading ? "CONFIRM" : "Loading..."}
        </button>
      )}
    </div>
  );
}
