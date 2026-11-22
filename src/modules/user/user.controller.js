import { Router } from "express";
import { successResponse } from "../../common/response/success.response.js";
import auth from "../../middlewares/auth.middleware.js";
import { logout, rotateToken, saveProfilePic } from "./user.service.js";
import { tokenTypeEnum } from "../../common/enum/token.enum.js";
import localUpload, {
  acceptedFileTypesEnum,
} from "../../common/utils/multer/multer.config.js";
import { handleFileMiddlware } from "../../middlewares/multer.middleware.js";

export const userController = Router();

// userController.get("/get-profile", auth(), async (req, res) => {
//   try {
//     successResponse({
//       res,
//       statusCode: 201,
//       msg: "created",
//       data: { userData: req.user, payload: req.payload },
//     });
//   } catch (error) {
//     res.status(400).json(error.stack);
//   }
// });

userController.post(
  "/rotate-token",
  auth(tokenTypeEnum.REFRESH),
  async (req, res) => {
    try {
      const rotateTokenResult = await rotateToken(req.payload);
      successResponse({
        res,
        statusCode: 201,
        msg: "created",
        data: rotateTokenResult,
      });
    } catch (error) {
      res.status(400).json(error.stack);
    }
  },
);

userController.post(
  "/upload-profile-pic",
  auth() ,
  // localUpload({acceptedFileTypes : acceptedFileTypesEnum.IMAGE}).array("profile-pic" ,2),
  // localUpload({ acceptedFileTypes: acceptedFileTypesEnum.IMAGE }).fields([{name : "profile-pic" , maxCount : 1} , {name : "cover-pic"}]),
  // localUpload({ acceptedFileTypes: acceptedFileTypesEnum.IMAGE }).any(),
  // localUpload({ acceptedFileTypes: acceptedFileTypesEnum.IMAGE , folderName : "User"}).array("profile-pic"),
  // validateActualFileType({ acceptedFileTypes: acceptedFileTypesEnum.IMAGE , folderName : "User"}),
  handleFileMiddlware({
    multerMiddlware: localUpload({
      acceptedFileTypes: acceptedFileTypesEnum.IMAGE,
      folderName: "User",
    }).single("profile-pic"),
    acceptedFileTypes: acceptedFileTypesEnum.IMAGE,
    folderName: "User",
  }),

  async (req, res) => {
    successResponse({
      res,
    });
    await saveProfilePic(req.user , req.file.finalPath)
  },
);

userController.post("/logout", auth(), async (req, res) => {
  const result = await logout(req.payload, req.user, req.body.action);
  successResponse({
    res,
    statusCode: 201,
    msg: "done",
    data: result,
  });
});
