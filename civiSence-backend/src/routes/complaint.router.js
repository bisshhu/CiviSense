import {Router} from"express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    createComplaint,
    getUserComplaints,
    getComplaintId,
    getComplaintPortals
}  from "../controllers/complaint.controller.js"


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
router.route("/").get(verifyJWT,getUserComplaints);
router.route("/:complaintId").get(verifyJWT,getComplaintId);
router.route("/:complaintId/portals").get(verifyJWT,getComplaintPortals);
export default router