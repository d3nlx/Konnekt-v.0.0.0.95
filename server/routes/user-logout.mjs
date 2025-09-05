import { request, response, Router } from "express";

const router = Router();

router.post('/api/auth/logout', (request, response) => {
  if (!request.user) return response.sendStatus(401);

  request.logout((err) => {
    if (err) return response.sendStatus(400);

    request.session.destroy((err) => {
      if (err) return response.sendStatus(500);
      response.clearCookie('connect.sid');
      return response.sendStatus(200);
    });
  });
});

export default router;