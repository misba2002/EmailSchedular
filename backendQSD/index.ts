import express, { Request, Response } from "express";
import cors from "cors";
import emailRouter from "./routes/emails.js";
import "./emailWorker.js";
import { redis } from "./redis.js";
import { pool } from "./db.js";
import dotenv from "dotenv";
import { scheduleEmail } from "./emailSchedular.js";

dotenv.config();

const app =express();
app.use(express.json());
const Port =process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*", // allow frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use("/emails", emailRouter);

app.get("/",(req,res)=>{
    res.json({status:"ok"});
});



app.post("/send-email", async (req: Request, res: Response) => {
  const { to, subject, body, scheduled_at,delay, hourly_limit } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  const recipients = to.split(",").map((r: string) => r.trim());
  const emailIds: number[] = [];

  for (const recipient of recipients) {
    const emailId = await scheduleEmail(
      recipient,
      subject,
      body,
      new Date(scheduled_at),
       Number(delay || 0),         // <-- delay in ms
       Number(hourly_limit || 0)
      

    );
    emailIds.push(emailId);
  }

  res.json({ success: true, emailIds });
});



app.listen(Port,async ()=>{

    try{
        // Testing redis
        const redisPing= await redis.ping();
        console.log("Redis ping : ",redisPing);

        //Testing postgres
        const pgRes=await pool.query("SELECT NOW()");
        console.log("Postgres connected ,time : ",pgRes.rows[0].now);

        // Server is listening
         console.log(`Server is running on port : ${Port}`);

    }catch(err){
       
        console.error("❌ StartUP error",err);

    }
   

});






