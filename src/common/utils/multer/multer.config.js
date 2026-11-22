import multer from "multer";
import { mkdir } from "fs/promises";
import { resolve } from "path";

export const acceptedFileTypesEnum = {
  IMAGE: ["image/png", "image/jpeg", "image/jpg"],
  PDF: [""],
};

function localUpload({ acceptedFileTypes = [], maxFileSize = 5 , folderName = "General" }) {
  // const storage = multer.diskStorage({
  //   destination: async (req, file, cb) => {
  //     const dest = `./assets/${folderName}`;
  //     await mkdir(resolve(dest), { recursive: true });
  //     cb(null, dest);
  //   },
  //   filename: (req, file, cb) => {
  //     cb(null, file.originalname);
  //   },
  // });
  const storage = multer.memoryStorage()

  const fileFilter = (req, file, cb) => {
    if (acceptedFileTypes.length && !acceptedFileTypes.includes(file.mimetype)) {
      cb(new Error("Invalid FileType", { cause: { statusCode: 400 } }));
    }
    cb(null, true);
  };
  return multer({
    storage,
    fileFilter,
    limits: { fileSize: maxFileSize * 1024 * 1024 },
  });
}

export default localUpload;
