import { v2 as cloudinary } from "cloudinary";
import fs from "fs"


    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

    const uploadOnCloudinary = async (localfilepath) => {
        try {
            if (!localfilepath){
                return null;
            }
            const response = await cloudinary.uploader.upload(localfilepath,{
                resource_type:"auto"
            }) 
            //file has been uploaded succesfully
            console.log("file has been uploaded sucessfully",response.url);
            return response
            
        } catch (error) {
            fs.unlinkSync(localfilepath) //remove the locally saved files that are not used as the operation failed
            return null
        }
    }

    export { uploadOnCloudinary }