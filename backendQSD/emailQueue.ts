import { Queue } from "bullmq";
import { redis } from "./redis.js";
import dotenv from "dotenv";
dotenv.config();





//CREATING A QUEUE WITH CONNECTION WITH REDIS
export const emailQueue = new Queue("emailQueue",{
    connection:redis,
    defaultJobOptions:{
        attempts:3,
        removeOnComplete:true,
        removeOnFail:false,

    }
    
});
console.log("📬 Email Queue initialized with rate limiting");
