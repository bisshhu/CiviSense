import {Router} from"express"
import { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    verifyEmail
    } from "../controllers/auth.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
const router=Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken)
router.route("/me").get(
    verifyJWT,
    getCurrentUser
);
router.route("/verify-email").post(verifyEmail)
export default router