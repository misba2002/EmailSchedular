import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redis=new IORedis(
    {
        host:process.env.REDIS_HOST,
        port:process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
        password: process.env.REDIS_PASSWORD,
        tls: {},  
         maxRetriesPerRequest: null,
    }
);