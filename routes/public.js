import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

//cadastro
router.post("/cadastro", async (req, res) => {
  try {
    const user = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(user.password, salt);

    const userDB = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashPassword,
      },
    });
    res.status(201).json(userDB);
  } catch (error) {
    res.status(450).json({ messege: "erro ao criar usuario" });
  }
});

//login
router.post("/login", async (req, res) => {
  try {
    const userInfo = req.body;

    //Busca o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { email: userInfo.email },
    });

    //Verifica se o usuário existe dentro do banco
    if (!user) {
      return res.status(404).json({ messege: "Usuario não encontrado" });
    }

    //Compara a senha fornecida com a senha criptografada do banco
    const isMatch = await bcrypt.compare(userInfo.password, user.password);
    if (!isMatch) {
      return res.status(400).json({ messege: "Senha incorreta" });
    }

    //Gera um token JWT
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json(token);
  } catch (error) {
    res.status(500).json({ messege: "Error ao fazer login" });
  }
});

export default router;
