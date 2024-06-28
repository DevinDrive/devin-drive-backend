import { Router } from "express";
import { errorTest, signUpHandler, test, loginHandler } from "../controllers/common.js";
import { sendCodeHandler, teleLoginHandler } from "../controllers/auth.js";
import { authMiddleware } from "../middleware/authorize.js";
import multer from "multer";
import { addToCollection, createCollection, getAFile, checkLogin, getAllFilesFromACollection, deleteFile, deleteFolder } from "../controllers/collections.js";
import { renameFileHandler } from "../controllers/files.js";
import { uploadChunkHandler } from "../controllers/upload.js";

const storage = multer.diskStorage({
  destination: function(req,res , cb) {
    cb(null, 'files/'); // Specify the directory where files will be stored
  },
  filename: function(req, file, cb) {
    req.fileName = Date.now() + file.originalname
    req.fileOrgName = file.originalname
    cb(null, Date.now() + file.originalname); // Use the original file name for saving
  }
});

const upload = multer({ storage: storage });
export const router = Router()

// router.get("/test", test)
//router.get("/error", errorTest)

// handle authentication
router.post('/signup', signUpHandler)
router.post('/login', loginHandler)

router.post("/sendCode",authMiddleware, sendCodeHandler)
router.post("/loginTelegram",authMiddleware, teleLoginHandler)
router.post("/checkLogin", authMiddleware,checkLogin)


// handle folders and files
router.get("/getAllFilesFromCollection", authMiddleware,getAllFilesFromACollection)
router.get("/getAFile", authMiddleware,getAFile)
router.post("/createCollection", authMiddleware,createCollection)
router.get("/deleteFile/", authMiddleware,deleteFile)
router.get("/deleteFolder/", authMiddleware,deleteFolder)
router.post("/addToCollection", authMiddleware,upload.array('files'), addToCollection)
router.post("/rename", authMiddleware,renameFileHandler)
router.post("/upload",authMiddleware,upload.single('file'),uploadChunkHandler)