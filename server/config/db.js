import mongoose from "mongoose";

const connectWithUri = async (uri) => {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    family: 4,
  });
};

const connectDB = async () => {
  try {
    const primaryUri = process.env.MONGO_URI;
    const directUri = process.env.MONGO_URI_DIRECT;

    if (!primaryUri) {
      throw new Error("MONGO_URI is missing in .env");
    }

    try {
      await connectWithUri(primaryUri);
      console.log("MongoDB Connected");
      return;
    } catch (primaryError) {
      const isSrvDnsError =
        primaryError.message && primaryError.message.includes("querySrv");

      if (!isSrvDnsError || !directUri) {
        throw primaryError;
      }

      console.warn("SRV DNS lookup failed. Retrying with MONGO_URI_DIRECT...");
      await connectWithUri(directUri);
      console.log("MongoDB Connected via direct URI");
    }
  } catch (error) {
    console.error("DB Connection Error:", error.message);
    if (error.message && error.message.includes("querySrv")) {
      console.error(
        "SRV DNS lookup failed. Add MONGO_URI_DIRECT (mongodb://...) in .env for fallback.",
      );
    }
    process.exit(1);
  }
};

export default connectDB;
