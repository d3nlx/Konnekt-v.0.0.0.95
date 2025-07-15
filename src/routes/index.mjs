import { Router } from "express";
import registrationRouter from "./user-registration.mjs";
import loginRouter from "./user-login.mjs"
import logoutRouter from "./user-logout.mjs"
import profileRouter from "./user-profile.mjs";

const router = Router();

router.use(registrationRouter);
router.use(loginRouter);
router.use(logoutRouter);
router.use(profileRouter);

export default router;