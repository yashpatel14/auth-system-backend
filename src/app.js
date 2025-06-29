import  express  from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import hpp from "hpp";
import helmet from "helmet";
import morgan from "morgan";



const app = express()

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req, res) => {
    return req.clientIp; // IP address from requestIp.mw(), as opposed to req.ip
  },
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${
        options.max
      } requests per ${options.windowMs / 60000} minutes`
    );
  },
});
  
  app.use(helmet());
  app.use(hpp());
  app.use("/api", limiter);
  
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }
  
  app.use(express.json({ limit: "10kb" })); // Body limit is 10kb
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));
  app.use(cookieParser());
  
  // CORS Configuration
  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "device-remember-token",
        "Access-Control-Allow-Origin",
        "Origin",
        "Accept",
      ],
    })
  );


import authRoutes from "./routes/auth.route.js";




app.use("/api/v1/auth", authRoutes);

  


export {app}