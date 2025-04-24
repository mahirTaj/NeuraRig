const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
    cloud_name : "dar1fqq6u",
    api_key : "247133583795596",
    api_secret : "8eowPsLsmEitIenI9VlsImT-r6I",
});

const storage = new multer.memoryStorage();

async function imageUploadUtil(file) {
    const result = await cloudinary.uploader.upload(file, 
        {
            resource_type: "auto",
        }
    );

    return result;
}

const upload = multer({storage});

module.exports = {upload, imageUploadUtil};