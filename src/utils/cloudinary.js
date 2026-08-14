import {v2 as cloudinary} from "cloudinary"
import { log } from "console";
import fs from "fs"

cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.API_KEY, 
        api_secret: process.env.API_SECRET // Click 'View API Keys' above to copy your API secret
    });

const uploadOnCloudinary= async (localFilePath)=>{
    try {
        if(!localFilePath) return null;
        //upload file on cloudinary
        
        const response= await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })//File has been uploaded successfully
        
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        console.log("error : ",error)
        if (localFilePath && fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
}
        // remove the locally saved file as the upload operation got failed 
        return null 
    }
}
export {uploadOnCloudinary}