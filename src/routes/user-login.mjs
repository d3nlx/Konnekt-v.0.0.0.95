import { request, response, Router } from "express";
import passport from 'passport';

const router = Router();

router.post('/api/auth', passport.authenticate("local"), (request, response) => {
  response.sendStatus(200)
});

router.get('/api/auth/status', (request, response) => {
  console.log(`Inside /auth/status endpoint`);
  console.log(request.user);
  console.log(request.session);
  console.log(request.sessionID);
  if (request.user) return response.send(request.user);
  return request.user ? response.send(request.user) : response.sendStatus(401);
});

export default router;