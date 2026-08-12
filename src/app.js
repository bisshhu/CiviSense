import express from "express";
import cors from "cors";
import router from "./routes/auth.router.js";
import { errorHandler } from "./middlewares/error.middleware.js";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", router);
app.use(errorHandler);
app.get("/", (req, res) => {
  res.json({ message: "CiviSense API is running" });
});

export default app;