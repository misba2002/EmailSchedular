const API_URL = process.env.NEXT_PUBLIC_API_URL;

// SEND EMAIL PAYLOAD
export interface EmailPayload {
  recipients: string[];
  subject: string;
  body: string;
  scheduledAt?: string;
  delay?: number;
  hourlyLimit?: number;
}


export async function getEmails(status: "scheduled" | "sent") {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/emails?status=${status}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch emails");
  }

  return res.json();
}

export const sendEmail = async (payload: EmailPayload) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: payload.recipients.join(","),  // multiple recipients supported
      subject: payload.subject,
      body: payload.body,
      scheduled_at: payload.scheduledAt || new Date().toISOString(),
      delay: payload.delay || "0",
      hourly_limit: payload.hourlyLimit || "0",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to schedule email");
  }

  return response.json();
};