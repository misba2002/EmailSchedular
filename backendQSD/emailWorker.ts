import { Worker } from "bullmq";
import nodemailer, { Transporter } from "nodemailer";
import { redis } from "./redis";
import { pool } from "./db";
import dotenv from "dotenv";
import { Job } from "bullmq";
import { emailQueue } from "./emailQueue";
dotenv.config();



const CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || "3");

console.log("🚀 Worker initialized");


new Worker(
  "emailQueue",
  async (job: Job<{ emailId: number }>) => {
    const { emailId } = job.data;
    console.log("🧾 Processing emailId:", emailId);

    // FETCH EMAIL
    const result = await pool.query(
      `SELECT recipient, subject, body,status, delay, hourly_limit
       FROM emails
       WHERE id = $1`,
      [emailId]
    );

    // IF EMAIL IS ABSENT
    if (result.rows.length === 0) throw new Error("Email not found in DB");

    const { recipient, subject, body ,status, delay, hourly_limit } = result.rows[0];

    
    // IDEMPOTENCY CHECK
    if (status === "sent") {
      console.log("⚠️ Email already sent, skipping:", emailId);
      return;
    }



     // 1️⃣ Hourly limit check
    const hourWindow = Math.floor(Date.now() / (60 * 60 * 1000)); // current hour
    const counterKey = `emails_sent:${hourWindow}`;

    const sentCount = parseInt((await redis.get(counterKey)) || "0");

    if (sentCount >= hourly_limit) {
      console.log(`⏳ Hourly limit reached, delaying email ${emailId}`);
      // reschedule for next hour
       // Delay until start of next hour
      const now = Date.now();
      const nextHour = (hourWindow + 1) * 60 * 60 * 1000;
      const delayUntilNextHour = nextHour - now;

      
      // Re-add job to queue using the imported queue
  await emailQueue.add(
    "send email",
    { emailId },
    {
      delay: delayUntilNextHour,
      attempts: job.opts.attempts || 3,
    }
  );

      console.log(`🔄 Email ${emailId} rescheduled for next hour`);
      return; 
    
    }

    // SEND EMAIL + UPDATE STATUS
    try {
      const transporter: Transporter = nodemailer.createTransport({
        host: process.env.ETHEREAL_HOST,
        port:Number( process.env.ETHEREAL_PORT),
        secure: false,
        auth: {
          user: process.env.ETHEREAL_USER,
          pass: process.env.ETHEREAL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"No Reply" <${process.env.ETHEREAL_USER}>`,
        to: recipient,
        subject,
        text: body,
      });

    //   UPDATING STATUS
      await pool.query(`UPDATE emails SET status='sent',sent_at=NOW() WHERE id=$1`, [emailId]);

        // 4️⃣ Increment Redis counter
    await redis.incr(counterKey);
    // set expiry to 2 hours to auto-clean old keys
    await redis.expire(counterKey, 2 * 60 * 60);

    console.log(`✅ Email ${emailId} sent, total sent this hour: ${sentCount + 1}`);

      
    } catch (err) {
      console.error("❌ Failed to send email:", emailId, err);



    //   RETRY TRACKING ON EVERY
       await pool.query(
    `UPDATE emails 
     SET retry_count = $2 
     WHERE id = $1`,
    [emailId, job.attemptsMade + 1]
  );
      
    //   CHECK LAST ATTEMPT 
     const isLastAttempt = job.attemptsMade + 1 >= (job.opts?.attempts || 3);   



     //  FAILED only on LAST retry
      if (isLastAttempt) {
        await pool.query(
          `UPDATE emails 
           SET status='failed', retry_count=$2 
           WHERE id=$1`,
          [emailId, job.attemptsMade + 1]
        );
      }


      throw err; // allow BullMQ to retry
    }
  },
  { connection: redis ,
      concurrency: CONCURRENCY,
    limiter: {
      max: 1,                          // only 1 email per MIN_DELAY_BETWEEN_EMAILS
      duration: 2000,
    
    },
  }
);

console.log("🚀 Email Worker started with concurrency and rate limiting");
