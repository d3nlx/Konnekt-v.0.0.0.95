import { request, response, Router } from "express";
import { User } from "../mongoose/schemas/user.mjs";
import { checkSchema, matchedData, validationResult } from "express-validator";
import { createUserValidationSchema } from "../utils/validationShchemas.mjs"
import { hashPassword } from "../utils/helper.mjs";

const router = Router();

router.get('/api/hello', (request, response) => {
  response.send({msg: "hello world! server on"})
});

router.post('/api/users', checkSchema(createUserValidationSchema), async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) return res.status(400).send(result.array());
  const data = matchedData(req);
  data.password = hashPassword(data.password);
  const newUser = new User(data);
  try {
    const savedUser = await newUser.save();
    req.login(savedUser, (err) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      return res.status(201).send(savedUser);
    });
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }
});

router.get('/api/profile', (req, res) => {
  if (!req.user) {
    return res.status(401).send({ msg: 'Not authenticated' });
  }

  res.send({
    name: req.user.name,
    phonenumber: req.user.phonenumber,
    displayName: req.user.displayName,
    password: req.user.password, // потом уберёшь
  });
});


export default router;