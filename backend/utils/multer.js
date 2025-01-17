// const multer = require("multer");
// const path = require("path");
// const fs = require('fs');

// // Ensure uploads directory exists
// console.log(__dirname)
// const uploadDir = path.join(__dirname, "../uploads");
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Define storage with dynamic file extension handling
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, uploadDir); // Pointing to the correct uploads folder in the root
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//         const filename = file.originalname.split(".")[0];
//         const extension = path.extname(file.originalname); // Use original file extension
//         cb(null, `${filename}-${uniqueSuffix}${extension}`);
//     }
// });

// // Define file filter to accept certain file types (images, videos, documents)
// const fileFilter = (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png|gif|mp4|mkv|avi|pdf|doc|docx|txt/; // Add file extensions as needed
//     const mimeType = allowedTypes.test(file.mimetype);
//     const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

//     if (mimeType && extname) {
//         return cb(null, true);
//     } else {
//         cb(new Error("Invalid file type. Only images, videos, and documents are allowed."), false);
//     }
// };

// // Limit file size (optional), e.g., 10 MB = 10 * 1024 * 1024
// const limits = { fileSize: 5 * 1024 * 1024 };

// // Export multer upload configuration
// exports.upload = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: limits
// });


const multer = require("multer");

// Define memory storage
const storage = multer.memoryStorage();

// Define file filter to accept certain file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mkv|avi|pdf|doc|docx|txt/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(file.originalname.toLowerCase());

    if (mimeType && extname) {
        return cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only images, videos, and documents are allowed."), false);
    }
};

// Limit file size (e.g., 5 MB = 5 * 1024 * 1024)
const limits = { fileSize: 5 * 1024 * 1024 };

// Export multer upload configuration
exports.upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: limits,
});
