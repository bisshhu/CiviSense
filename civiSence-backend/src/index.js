import connectDB from "./db/index.js";
import app from "./app.js";

connectDB()
  .then(() => {
    app.on("error",(error)=>{
        console.log("Error : ",error) 
        throw error;
    }) 
    app.listen(process.env.PORT || 5001, () => {
      console.log(`Server is running on port ${process.env.PORT || 5001}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });