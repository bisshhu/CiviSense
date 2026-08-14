import {Router} from"express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {createComplaint}  from "../controllers/complaint.controller.js"
const router=Router()
import { upload } from "../middlewares/multer.middleware.js"
router.route("/create-complaint").post(
    verifyJWT,
    upload.fields([
        {
            name:"image",
            maxCount:1
        }
    ]),
    createComplaint
)
export default router