import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, "../public/upload"));
  },
  filename: (req, file, cb) => {
    const fieldName = file.fieldname;
    const currentDate = Date.now();
    const fileName = `${fieldName}-${crypto.randomInt(
      100,
      1000
    )}-${currentDate}${path.extname(file.originalname)}`;
    cb(null, fileName);
  },
});

const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024}, 
}).fields([
  { name: "img1", maxCount: 1 },
  { name: "img2", maxCount: 1 },
  { name: "img3", maxCount: 1 },
]);

export const handleUpload = (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          req.flash("ProductError", "File size too large. Max limit is 5MB.");
        } else {
          req.flash("ProductError", err.message);
        }
      } else {
        req.flash("ProductError", "An error occurred during file upload.");
      }
      return res.redirect(req.originalUrl);
    }
    next();
  });
};

export default uploadMiddleware;
