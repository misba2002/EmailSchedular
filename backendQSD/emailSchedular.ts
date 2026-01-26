
import { emailQueue } from "./emailQueue.js";
import { pool } from "./db.js";



// ADD EMAILS TO THE JOB 
export async function scheduleEmail(
    to:string,
    subject:string,
    body:string,
    scheduledAt:Date,
    delayMs: number ,        // minimum delay between emails
    hourlyLimit: number,      // max emails per hour

    ):Promise<number> {

    const result= await pool.query(
     `INSERT INTO emails (recipient, subject, body,scheduled_at,delay, hourly_limit)
     VALUES ($1, $2, $3 ,$4,$5,$6)
     RETURNING id`,
    [to, subject, body,scheduledAt, delayMs, hourlyLimit]

    );

    const emailId = result.rows[0].id;
    //  Calculate delay
     const now = new Date();
    let jobDelay = scheduledAt.getTime() - now.getTime();
    if (jobDelay < 0) jobDelay = 0;

    console.log("📦 Email stored in DB with id:", emailId);

    //ADD JOB TO QUEUE WITH EMAILID ONLY
    await emailQueue.add(
        "send email",
        {emailId},
        {
        delay: jobDelay,
        attempts: 3,
        
        }
    );
    console.log(`📦 Email stored in DB with id ${emailId}, scheduled at ${scheduledAt}`);

     return emailId;
    
}
