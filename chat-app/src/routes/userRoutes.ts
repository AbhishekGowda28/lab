import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { protect } from "../middleware/auth";
import { loginUser, registerUser } from "../controllers/userController";

const router = Router();

router.post("/register", [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Email is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
], registerUser);

router.post("/login", [
    body("email").isEmail().withMessage("Email is required"),
    body("password").notEmpty().withMessage("Password is required")
], loginUser);


router.get("/me", protect, async (req: Request, res: Response): Promise<void> => {
    res.json({ message: "User profile", user: req.user });
});

export default router;