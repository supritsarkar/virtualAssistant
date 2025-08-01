import React, { useRef, useState } from "react";
import { useContext } from "react";
import { UserDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
import { HiOutlineMicrophone } from "react-icons/hi2";
import { FiMicOff } from "react-icons/fi";
import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";
import { RiMenu3Fill } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";

export default function Home() {
  const navigate = useNavigate();
  const { userData, serverUrl, setUserData, getGeminiResponse } =
    useContext(UserDataContext);
  const [listening, setListening] = useState(false);
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const synth = window.speechSynthesis;
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [assistantStarted, setAssistantStarted] = useState(false);
  const isRecognizingRef = useRef(false);
  const [ham, setHam] = useState(false);
  const handleLogout = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      setUserData(null);
      console.log(error);
    }
  };

  const startRecognition = () => {
    try {
      recognitionRef.current?.start();
      setListening(true);
    } catch (error) {
      if (!error.message.includes("start")) {
        console.log("Recognition error", error);
      }
    }
  };

  //for assistant's voice reply

  const speak = (text) => {
    const utterence = new window.SpeechSynthesisUtterance(text);
    utterence.lang = "en-US";
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find((v) => v.lang === "en-US");
    if (englishVoice) {
      utterence.voice = englishVoice;
    }
    
    isSpeakingRef.current = true; //we can speak the command

    //after saying the command we are gonna set listing property to stop
    utterence.onend = () => {
      setAiText("");
      isSpeakingRef.current = false;
      setTimeout(() => {//for avoiding race condition
        startRecognition();
      }, 800);
    };
    synth.cancel();
    //then speal it out loud
    synth.speak(utterence);
  };

  const handleCommand = (data) => {
    const { type, userInput, response } = data;
    speak(response);

    if (type === "google-search") {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.google.com/search?q=${query}`, "_blank");
    }

    if (type === "calculator-open") {
      window.open("https://www.google.com/search?q=calculator", "_blank");
    }
    if (type === "facebook-open") {
      window.open("https://www.facebook.com/", "_blank");
    }
    if (type === "instagram-open") {
      window.open("https://www.instagram.com/", "_blank");
    }
    if (type === "weather-show") {
      window.open(
        `https://weather.com/en-IN/weather/today/l/INXX0096:1:IN?Goto=Redirected`,
        "_blank"
      );
    }
    if (type === "youtube-search" || type === "youtube_play") {
      const query = encodeURIComponent(userInput);
      window.open(
        `https://www.youtube.com/results?search_query=${query}`,
        "_blank"
      );
    }
  };

  //voice recognition setup
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognitionRef.current = recognition;
      
    let isMounted = true;

    //this will start the voice recognition if the the voice taking and the recognizing is off
    const startTimeout = setTimeout(()=>{
       if ( isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
        try {
          recognition.start();
          console.log("Recognition requested to start");
        } catch (error) {
          if (error.name !== "InvalidStateError") {
            console.error("Start error :", error);
          }
        }
      }
    },1000) ;
      
  //Purpose: Safely start speech recognition only if not already speaking or listening.
    // ✅ Prevents calling recognition.start() when it's already active.
    // ❌ You're checking the refs directly, not .current, which makes this always true.
    // Fix: !isSpeakingRef.current && !isRecognizingRef.current
    // 🔸 4. Speech Recognition Events

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
    };

    //after performing one task it will end it's mic then
    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
      if(isMounted && ! isSpeakingRef.current){
        setTimeout(()=>{
          if(isMounted){
            try{
                recognition.start();
                console.log("Recognition restarted")
            }catch(err){ 
              if(err.name!== "IvalidSteteError") console.err(err)
            }
          }
        })
      }
    };

    //this will call and start the saferecognition again
    // if (!isSpeakingRef.current) {
    //   setTimeout(() => {
    //     safeRecognition();
    //   }, 1000);
    // }

    //for error
    recognition.onerror = (event) => {
      console.warn("Reconition error :", event.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (event.error !== "aborted" && !isRecognizingRef.current) {
        setTimeout(() => {
          if(isMounted){
            try{
              recognition.start();
               console.log("Recognition restarted after error!");
            }catch(err){
              if(err.name !== "InvalidStateError") console.log(err);
            }
          }
          
        }, 1000);
      }
    };

    const fallback = setInterval(() => {
      if (!isSpeakingRef.current && !isRecognizingRef.current) {
        recognition.start();
      }
    }, 10000);

    recognition.start();
    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();

      //now check the command contains the assistant name or not
      if (
        transcript.toLowerCase().includes(userData.assistantName.toLowerCase())
      ) {
        setAiText("");
        setUserText(transcript);
        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);
        const data = await getGeminiResponse(transcript);
        console.log(data);
        handleCommand(data);
        setAiText(data.response);
        setUserText("");
      }
    };
   
  
      const greetings = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with ?`);
      greetings.lang = 'en-US';
      window.speechSynthesis.speak(greetings);







    return () => {
      isMounted =false;
      clearTimeout(startTimeout);
      recognition.stop();
      setListening(false);
      isRecognizingRef.current = false;
      clearInterval(fallback);
    };
  }, []);

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353f6] flex justify-center items-center flex-col gap-[15px] overflow-hidden">
      <RiMenu3Fill
        className="text-white lg:hidden absolute top-[20px] right-[20px] w-[25px] h-[30px] "
        onClick={() => setHam(true)}
      />
      <div
        className={`absolute lg:hidden top-0 w-full h-full bg-[#00000056] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${
          ham ? "translate-x-0" : "translate-x-full"
        } trasnsition-transform`}
      >
        <RxCross2
          className="text-white  absolute top-[20px] right-[20px] w-[25px] h-[30px]"
          onClick={() => setHam(false)}
        />
        <button
          className="min-w-[150px]  h-[60px] text-black font-semibold text-[19px]  bg-white rounded-full  top-[20px] right-[20px] cursor-pointer "
          onClick={handleLogout}
        >
          LogOut
        </button>
        <button
          className="cursor-pointer min-w-[150px] h-[60px] text-black font-semibold text-[19px]  bg-white rounded-full mt-[30px] top-[100px] right-[20px]"
          onClick={() => navigate("/customize")}
        >
          {" "}
          Customize{" "}
        </button>

        <div className="w-full h-[2px] bg-gray-400"></div>
        <h1 className="text-white font-semibold text-[19px]">History</h1>
        <div className="w-full h-[400px] gap-[20px] overflow-y-auto  flex flex-col ">
          {userData.history?.map((his) => (
            <span className="text-[#F5EFE7]">{his}</span>
          ))}
        </div>
      </div>
      <button
        className="min-w-[150px]  h-[60px] text-black font-semibold text-[19px] absolute bg-white rounded-full mt-[30px] top-[20px] right-[20px] cursor-pointer hidden lg:block"
        onClick={handleLogout}
      >
        LogOut
      </button>
      <button
        className="cursor-pointer min-w-[150px] h-[60px] text-black font-semibold text-[19px] absolute bg-white rounded-full mt-[30px] top-[100px] right-[20px] hidden lg:block"
        onClick={() => navigate("/customize")}
      >
        {" "}
        Customize{" "}
      </button>

      <div className="w-[500px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg ">
        <img
          src={userData?.assistantImage}
          alt=""
          className="h-full object-cover "
        />
      </div>
      <h1 className="text-white text-[18px] font-semibold">
        I'm {userData?.assistantName}
      </h1>
      <div>
        {!aiText && (
          <img
            src={userImg}
            alt=""
            className="w-[200px] onClick={() => {
    setAssistantStarted(true);
    startRecognition();
  }"
          />
        )}
        setAssistantStarted(false);
        {aiText && !assistantStarted && (
          <img src={aiImg} alt="" className="w-[200px]" />
        )}
        <h1 className="text-white left-[5px] text-[18px] font-semibold text-wrap">
          {" "}
          {userText ? userText : aiText ? aiText : null}
        </h1>
      </div>
    </div>
  );
}
