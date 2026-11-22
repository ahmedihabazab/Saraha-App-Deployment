import localUpload, {
  acceptedFileTypesEnum,
} from "../common/utils/multer/multer.config.js";
import {
  processFields,
  processFile,
  processFiles,
} from "../common/utils/multer/multer.service.js";
import { unlink } from "fs/promises";

export async function validateFileContent({
  req,
  acceptedFileTypes = [],
  folderName,
}) {
  if (req.file) {
    await processFile(req.file, acceptedFileTypes, folderName);
  } else if (Array.isArray(req.files)) {
    await processFiles(req.files, acceptedFileTypes, folderName);
  } else if (typeof req.files === "object") {
    await processFields(req.files, acceptedFileTypes, folderName);
  }
}

export function handleFileMiddlware({ multerMiddlware , acceptedFileTypes, folderName }) {
  return async (req, res, next) => {

    const customNext = async (error) => {
      if (error) {
        next(error);
        return;
      }

      try {
        await validateFileContent({ req, acceptedFileTypes, folderName });
        next();
      } catch (error) {
        next(error);
      }
    };

    return multerMiddlware(req, res, customNext);
  };
}
