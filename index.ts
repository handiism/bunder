import { PrismaClient } from "@prisma/client";
import express from "express";
import { z } from "zod";

const prisma = new PrismaClient({ errorFormat: "minimal" });
const app = express();
app.use(express.json());
const port = 8000;

interface ResBody {
  status: "success" | "fail";
  message?: string;
  data?: Record<string, unknown>;
}

app.get("/", async (req, res) => {
  const body: ResBody = {
    status: "success",
  };

  try {
    const users = await prisma.user.findMany();
    body.data = { users };

    return res.status(200).json(body);
  } catch (error) {
    body.status = "fail";
    body.message = "unable to get all users";
    return res.status(200).json(body);
  }
});

app.post("/", async (req, res) => {
  const dto = z
    .object({
      email: z.string().email(),
      name: z.string(),
    })
    .safeParse(req.body);

  const body: ResBody = {
    status: "fail",
  };

  if (!dto.success) {
    body.message = "input validation failed";
    return res.status(404).json(body);
  }

  const { email, name } = dto.data;

  try {
    const user = await prisma.user.create({ data: { email, name } });
    body.status = "success";
    body.data = { user };
    return res.status(200).json(body);
  } catch (error) {
    body.status = "fail";
    body.message = "unable to create user";
    return res.status(200).json(body);
  }
});

app.get("/:id", async (req, res) => {
  const identifier = z.coerce.number().safeParse(req.params?.id);
  const body: ResBody = {
    status: "fail",
  };

  if (!identifier.success) {
    body.message = "no identifier found";
    return res.status(400).json(body);
  }

  const id = identifier.data;

  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { id } });
    body.status = "success";
    body.data = { user };
    return res.status(200).json(body);
  } catch (e) {
    body.status = "fail";
    body.message = "user not found";
    return res.status(200).json(body);
  }
});

app.put("/:id", async (req, res) => {
  const identifier = z.coerce.number().safeParse(req.params?.id);

  const dto = z
    .object({
      email: z.coerce.string().email(),
      name: z.coerce.string(),
    })
    .safeParse(req.body);

  const body: ResBody = {
    status: "fail",
  };

  if (!identifier.success) {
    body.message = "no identifier found";
    return res.status(400).json(body);
  }

  const id = identifier.data;

  if (!dto.success) {
    body.message = "input validation failed";
    return res.status(404).json(body);
  }

  const { email, name } = dto.data;

  try {
    const user = await prisma.user.update({
      data: { email, name },
      where: { id },
    });
    body.status = "success";
    body.data = { user };
    return res.status(200).json(body);
  } catch (error) {
    body.status = "fail";
    body.message = "unable to update user";
    return res.status(200).json(body);
  }
});

app.delete("/:id", async (req, res) => {
  const identifier = z.coerce.number().safeParse(req.params?.id);
  const body: ResBody = {
    status: "fail",
  };

  if (!identifier.success) {
    body.message = "no identifier found";
    return res.status(400).json(body);
  }

  const id = identifier.data;

  try {
    const user = await prisma.user.delete({ where: { id } });
    body.status = "success";
    body.data = { user };
    return res.status(200).json(body);
  } catch (e) {
    body.status = "fail";
    body.message = "unable to delete user";
    return res.status(200).json(body);
  }
});

app.listen(port, () => {
  console.log(`Server started on :${port}`);
});
