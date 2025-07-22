import { request, response, Router } from "express";
import { User } from "../mongoose/schemas/user.mjs";
import { checkSchema, matchedData, validationResult } from "express-validator";
import { createUserValidationSchema } from "../utils/validationShchemas.mjs"
import { hashPassword } from "../utils/helper.mjs";

const router = Router();

router.get('/api/hello', (request, response) => {
  response.send({msg: "hello world! server on"})
});

router.post('/api/users/registration', checkSchema(createUserValidationSchema), async (req, res) => {
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

export default router;