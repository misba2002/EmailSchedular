import { Router, Request, Response } from "express";
import { sendEmailSchema } from "../validators/email.validator";
import { pool } from "../db";
import { z } from "zod";
import { scheduleEmail } from "../emailSchedular";

const router = Router();

/**
 * GET /emails?status=pending|sent|failed
 */
router.get("/", async (req: Request, res: Response) => {
  const status = req.query.status as string;

  if (!status) {
    return res.status(400).json({ error: "status is required" });
  }

  const result = await pool.query(
    `SELECT id, recipient, subject, body, status, scheduled_at, sent_at
     FROM emails
     WHERE status = $1
     ORDER BY scheduled_at DESC`,
    [status]
  );

  res.json(result.rows);
});
/** 
 * GET /emails/:id
 * Fetch single email details
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    `SELECT id, recipient, subject, body, status, scheduled_at, sent_at
     FROM emails
     WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Email not found" });
  }

  res.json(result.rows[0]);
});



/**
 * POST /emails/send
 */
router.post("/send", async (req: Request, res: Response) => {
  const parsed = sendEmailSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: z.flattenError(parsed.error),
    });
  }

  const { to, subject, body, scheduled_at } = parsed.data;

  const emailId = await scheduleEmail(
    to,
    subject,
    body,
    new Date(scheduled_at),
    Number(req.body.delay || 0),
    Number(req.body.hourly_limit || 0)
  );

  res.json({ success: true, emailId });
});

export default router;
