import mongoose from "mongoose";

// 👇 ඔයාගේ ඇත්තම MongoDB Link එක මෙතන දාන්න (Quotes ඇතුළේ)
const MY_MONGODB_URI = "mongodb+srv://chamimusiccreation_db_user:vX9fmIxkyi1ndxg6@cluster0.clzf0n2.mongodb.net/?appName=Cluster0";

export const connectDB = async () => {
  try {
    // දැන් .env එකෙන් නෙවෙයි, උඩ තියෙන MY_MONGODB_URI එකෙන් තමයි කනෙක්ට් වෙන්නේ
    if (!MY_MONGODB_URI) {
      console.warn("MONGODB_URI is not defined. Database will not connect.");
      return;
    }
    
    await mongoose.connect(MY_MONGODB_URI);
    console.log("MongoDB Connected Successfully!");
  } catch (error) {
    console.error("MongoDB Connection Error in Vercel:", error);
  }
};
