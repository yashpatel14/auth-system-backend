import { Router } from "express";
import { isAdmin, verifyJWT } from "../middlewares/auth.middlewares.js";
import { deleteUserById, getAllUsers, getUserById, logoutUserSession, updateUserRole } from "../controllers/admin.controller.js";

const router = Router();

router.get("/users", verifyJWT, isAdmin, getAllUsers);
router.get("/users/:userId", verifyJWT, isAdmin, getUserById);
router.post("/users/session/:sessionId", verifyJWT, isAdmin, logoutUserSession);
router.patch("/users/:userId", verifyJWT, isAdmin, updateUserRole);
router.delete("/users/:userId", verifyJWT, isAdmin, deleteUserById);

export default router;