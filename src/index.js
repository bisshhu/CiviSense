import express from "express"
import cors from "cors"
import mongoose from "mongoose"
const app= express()

app.use(cors())
app.use(express.json())

app.get("/",(req,res)=>{
    res.json({message:"civisence is running "})
})

const PORT=process.env.PORT||5001


const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();