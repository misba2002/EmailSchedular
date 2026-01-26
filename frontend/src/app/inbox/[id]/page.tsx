"use client";

import { FiArrowLeft, FiStar, FiTrash2 } from "react-icons/fi";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Email = {
  id: number;
  recipient: string;
  subject: string;
  body: string;
  status: "scheduled" | "sent" | "failed";
  scheduled_at: string;
  sent_at: string | null;
};

export default function EmailDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: session, status } = useSession();

  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);

   // 🔒 Protect page
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  

  useEffect(() => {
    async function fetchEmail() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/emails/${id}`
        );

        if (!res.ok) throw new Error("Failed to fetch email");

        const data = await res.json();
        setEmail(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated" && id) fetchEmail();
  }, [id, status]);

    if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }
  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Email not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}>
            <FiArrowLeft className="text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold">{email.subject}</h1>
        </div>

        <div className="flex items-center gap-4 text-gray-600">
          <FiStar />
          <FiTrash2 />
          <img
            src={session?.user?.image || "/avatar.png"}
            className="w-8 h-8 rounded-full"
            alt="user"
          />
        </div>
      </div>

      {/* Email content */}
      <div className="max-w-4xl mx-auto px-6 py-6 bg-white mt-6 rounded-lg shadow-sm">
        {/* Sender */}
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">
              {email.recipient[0].toUpperCase()}
            </div>
            <div>
              <p className="font-medium">
                {email.recipient}
                <span className="text-gray-500 text-sm">
                  {" "} &lt;{email.recipient}&gt;
                </span>
              </p>
              <p className="text-sm text-gray-500">to me</p>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            {new Date(
              email.sent_at || email.scheduled_at
            ).toLocaleString()}
          </p>
        </div>

        {/* Body */}
        <div className="mt-6 text-gray-800 text-sm leading-relaxed whitespace-pre-line">
          {email.body}
        </div>

        {/* Status */}
        <div className="mt-6">
          <span
            className={`inline-flex items-center px-3 py-1 text-xs rounded-full ${
              email.status === "sent"
                ? "bg-green-100 text-green-700"
                : email.status === "failed"
                ? "bg-red-100 text-red-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {email.status === "sent" && "✅ Sent"}
            {email.status === "failed" && "❌ Failed"}
            {email.status === "scheduled" && "⏰ Scheduled"}
          </span>
        </div>
      </div>
    </div>
  );
}
