import { Router } from "express";
import { errorTest, signUpHandler, test, loginHandler } from "../controllers/common.js";
import { sendCodeHandler, teleLoginHandler } from "../controllers/auth.js";
import { authMiddleware } from "../middleware/authorize.js";
import multer from "multer";
import { addToCollection, createCollection, getAFile, checkLogin, getAllFilesFromACollection, deleteFile, deleteFolder } from "../controllers/collections.js";
import { renameFileHandler } from "../controllers/files.js";
import { uploadChunkHandler } from "../controllers/upload.js";

const storage = multer.diskStorage({
  destination: function(_, _, cb) {
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

router.get("/test", test)
router.get("/error", errorTest)

// handle authentication
router.post('/signup', signUpHandler)
router.post('/login', loginHandler)

router.use(authMiddleware)

router.post("/sendCode", sendCodeHandler)
router.post("/loginTelegram", teleLoginHandler)
router.post("/checkLogin", checkLogin)


// handle folders and files
router.get("/getAllFilesFromCollection", getAllFilesFromACollection)
router.get("/getAFile", getAFile)
router.post("/createCollection", createCollection)
router.get("/deleteFile/", deleteFile)
router.get("/deleteFolder/", deleteFolder)
router.post("/addToCollection", upload.array('files'), addToCollection)
router.post("/rename", renameFileHandler)
router.post("/upload",upload.single('file'),uploadChunkHandler)