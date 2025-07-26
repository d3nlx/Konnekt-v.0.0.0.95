import { Router } from "express";
import registrationRouter from "./user-registration.mjs";
import loginRouter from "./user-login.mjs"
import logoutRouter from "./user-logout.mjs"
import profileRouter from "./user-profile.mjs";
import contactsRouter from "./contacts.mjs"
import messagesRouter from "./messages.mjs"

const router = Router();

router.use(registrationRouter);
router.use(loginRouter);
router.use(logoutRouter);
router.use(profileRouter);
router.use(contactsRouter);
router.use(messagesRouter);

export default router;