import { Router } from "express";

const router = Router();

router.get('/api/profile', (req, res) => {
  if (!req.user) {
    return res.status(401).send({ msg: 'Not authenticated' });
  }

  res.send({
    id: req.user._id,
    name: req.user.name,
    phonenumber: req.user.phonenumber,
    displayName: req.user.displayName,
    createdAt: req.user.createdAt,
    updatedAt: req.user.updatedAt
  });
});

export default router;
