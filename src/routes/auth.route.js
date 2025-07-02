import { Router } from "express";
import { forgotPassword, getActiveSessions, getProfile, googleLogin, login, logoutAllSessions, logoutSpecificSession, logoutUser, refreshAccessToken, register, resendEmailVerification, resetPassword, verifyEmail } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {upload} from "../middlewares/multer.middleware.js";
const router = Router();



router.post(
  "/register",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  register,
);
router.get("/verify/:token", verifyEmail);
router.post("/email/resend", resendEmailVerification);
router.post("/login", login);
router.post("/password/forgot",  forgotPassword);
router.post("/password/reset/:token", resetPassword);

router.get("/refresh-token", refreshAccessToken);

router.post("/logout", verifyJWT, logoutUser);
router.post("/logout/all", verifyJWT, logoutAllSessions);
router.get("/sessions", verifyJWT, getActiveSessions);
router.post("/sessions/:sessionId", verifyJWT, logoutSpecificSession);

router.post("/login/google", googleLogin);

router.get("/profile", verifyJWT, getProfile);

export default router;
