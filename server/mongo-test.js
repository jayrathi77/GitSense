import mongoose from "mongoose";

const uri =
  "mongodb+srv://jay:jay77777@cluster0.awtjwue.mongodb.net/gitsense?retryWrites=true&w=majority";

console.log("Connecting...");

mongoose
  .connect(uri)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Full Error:");
    console.error(err);
    process.exit(1);
  });