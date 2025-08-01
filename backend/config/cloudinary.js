import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
const uploadOnCloudinary = async (filePath) => {
  // Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  try {
    const uploadResult = await cloudinary.uploader.upload(filePath);
    fs.unlink(filePath, (error) => {
      if (error) {
        console.error(
          `Error occurred while deleting the file: ${error.message}`
        );
      } else {
        console.log(`${filePath} was deleted successfully.`);
      }
    });
    return uploadResult.secure_url;
  } catch (error) {
    fs.unlink(filePath, (error) => {
      if (error) {
        console.error(
          `Error occurred while deleting the file: ${error.message}`
        );
      } else {
        console.log(`${filePath} was deleted successfully.`);
      }
    });
    return res.status(500).json({message: "cloudinary error!"})
  }
  console.log(uploadResult);
};

export default uploadOnCloudinary;