import express from "express";
import cors from "cors";
import router from "./routes/auth.router.js";
import complaintRouter from"./routes/complaint.router.js"
import { errorHandler } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser"
const app = express();

app.use(cors(
  {
        origin: process.env.FRONTEND_URL,
        credentials: true,
    }
));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", router);
app.use("/api/complaint",complaintRouter)
app.use(errorHandler);
app.get("/", (req, res) => {
  res.json({ message: "CiviSense API is running" });
});

export default app;