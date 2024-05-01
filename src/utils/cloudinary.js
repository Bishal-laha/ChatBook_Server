import {v2 as cloudinary} from 'cloudinary';
import { v4 as uuid } from "uuid";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadOnCloudinary = async (file=[]) => {
    const uploadPromises = file.map((item) => {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload( `data:${item.mimetype};base64,${item.buffer.toString("base64")}`,
                {
                    resource_type: "auto",
                    public_id: uuid(),
                },(error, result) => {
                    if (error) return reject(error);
                    resolve(result);}
            );
        });
    });

  try {
    const results = await Promise.all(uploadPromises);
    const formattedResults = results.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
    return formattedResults;
  } catch (err) {
    throw new Error("Error uploading files to cloudinary", err);
  }
}


export const deleteFileFromCloudinary = (publicId)=>{
  publicId.map((item)=>{
      cloudinary.uploader.destroy(item, function(error, result) {
      if (error) {
        throw new Error("Error Deleting file in cloudinary",error);
      } 
        // console.log('Existing image deleted successfully:', result);
      })
  })
}