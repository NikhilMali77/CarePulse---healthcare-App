import cloudinary from 'cloudinary'
import dotenv from 'dotenv'
dotenv.config()

cloudinary.v2.config({
  cloud_name:'dmx577ow7',
  api_key: '626989884152728',
  api_secret: 'exk2NHGU4K4ke_JfKiJTmwTDotw'
})

export default cloudinary;
