import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authorize.js";
import { errorTest, signUpHandler, test, loginHandler, checkLogin } from "../controllers/common.js";
import { sendCodeHandler, teleLoginHandler } from "../controllers/auth.js";
import {deleteFolder, createFolder, addToFolder, getAllFilesFromFolder} from "../controllers/folder.js";
import {getAFile, deleteFile} from "../controllers/files.js";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'files/'); // Specify the directory where files will be stored
    },
    filename: function (req, file, cb) {
        req.fileName = Date.now()+file.originalname
        req.fileOrgName = file.originalname
        cb(null, Date.now()+file.originalname); // Use the original file name for saving
    }
});

const upload = multer({ storage: storage });
export const router = Router()

router.get("/test", test)
router.get("/error", errorTest)

// handle authentication
router.post('/signup', signUpHandler)
router.post('/login', loginHandler)

router.post("/sendCode", authMiddleware, sendCodeHandler)
router.post("/loginTelegram", authMiddleware, teleLoginHandler)
router.post("/checkLogin",authMiddleware,checkLogin)


// handle folders and files
router.get("/getAllFilesFromFolder",authMiddleware,getAllFilesFromFolder)
router.get("/getAFile",authMiddleware,getAFile)
router.post("/createFolder",authMiddleware,createFolder)
router.get("/deleteFile/",authMiddleware,deleteFile)
router.get("/deleteFolder/",authMiddleware,deleteFolder)
router.post("/addToFolder", upload.array('files'),authMiddleware, addToFolder)