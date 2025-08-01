import genToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";


//! Signup controller 
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(400).json({ message: "email already exists!" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "password must be six characters long!" });
    }
    //if the login and password is correctly followed the rules then it's time to hash it
    const hashedPassword = await bcrypt.hash(password, 10);

    //now use the hashedPass.. and create the user
    const user = await User.create({
      name,
      password: hashedPassword,
      email,
    });

    //after creating the token ,now pass the userId
    const token = await genToken(user._id);

    //parsing cookie to store it in webbrowser
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "strict",//Only send cookie for same-site requests
      secure: false,//this means 	Cookie can be sent over HTTP ,but later make it true
    });

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({message:`sign up error ${error}`});
  }
};

//!login controller 

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "email doesn't exists!" });
    }
    //check the passoword's authenticity using existing hashed password
    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
         return res.status(400).json({ message: "Incorrect Password!" });
    }
    
    //after creating the token using userId(mongo db's default)
    const token = await genToken(user._id);

    //parsing cookie to store it in webbrowser 
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: false,
    });

    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({message:`sign up error ${error}`});
  }
};


//! controller for the logout 

export const logOut = async (req,res)=>{
    try{

        //for clearing the cookie for the specific user's token
        res.clearCookie("token")
         return res.status(201).json({message : "Logout successfully"});
    }catch(error){
        return res.status(500).json({message:`logout error ${error}`});
    }
} 
