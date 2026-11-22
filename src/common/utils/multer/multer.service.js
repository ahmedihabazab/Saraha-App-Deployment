import { resolve } from "node:path";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { fileTypeFromBuffer } from "file-type";
import { BadRequestException } from "../../exeption/app.exception.js";
import { object } from "zod";
import { acceptedFileTypesEnum } from "./multer.config.js";
import { randomUUID } from "node:crypto";

// single      =>   req.file : {}
export async function processFile(
  file,
  acceptedFileTypes,
  folderName = "General",
) {
  let fileBuffer;

  if (file.path) {
    const filePath = file.path;
    fileBuffer = await readFile(resolve(filePath));
  } else if (file.buffer) {
    fileBuffer = file.buffer;
  }

  const { ext, mime: actualMime } = await fileTypeFromBuffer(fileBuffer);
  
  if (!file.path) {
    const dirPath = `./assets/${folderName}`;
    const path = `${dirPath}/${randomUUID()}.${ext}`;
    await mkdir(dirPath, { recursive: true });
    await writeFile(resolve(path), fileBuffer);

    file.finalPath = path;
  } else {
    file.finalPath = file.path;
  }
  
  if (!actualMime || (acceptedFileTypes.length && !acceptedFileTypes.includes(actualMime))) {
    throw BadRequestException({ errMsg: "Invalid actual file type" });
  }
  
}

// array , any =>   req.files : [{} , {}]
export async function processFiles(reqFiles, acceptedFileTypes, folderName) {
  for (const file of reqFiles) {
    try {
      await processFile(file, acceptedFileTypes, folderName);
    } catch (error) {
      await unlink(file.finalPath);
      throw error;
    }
  }
}

// fields      =>   req.files : { field1 : [{} , {}] , field2 : [{} , {}] }
export async function processFields(reqFiles, acceptedFileTypes, folderName) {
  for (const field of Object.keys(reqFiles)) {
    await processFiles(reqFiles[field], acceptedFileTypes, folderName);
  }
}
