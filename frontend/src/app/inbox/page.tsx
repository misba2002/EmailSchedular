"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiSearch, FiClock, FiSend } from "react-icons/fi";
import { getEmails } from "@/services/email";
import { useSession, signOut } from "next-auth/react";

export default function InboxPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"scheduled" | "sent">("scheduled");
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔒 Protect page: redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Fetch emails after session is authenticated
  useEffect(() => {
    if (status === "authenticated") {
      setLoading(true);
      getEmails(activeTab)
        .then(setEmails)
        .finally(() => setLoading(false));
    }
  }, [activeTab, status]);

  // Logout
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-white border-r p-4 flex flex-col">
        {/* Profile */}
        <div className="flex items-center gap-3 mb-6">
          <img
            src={session?.user?.image || "/avatar.png"}
            className="w-10 h-10 rounded-full"
            alt="User Avatar"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
            <p className="text-xs text-gray-500">{session?.user?.email}</p>
          </div>
        </div>

        {/* Compose */}
        <button
          onClick={() => router.push("/compose")}
          className="mb-4 bg-green-600 text-white py-2 rounded-md text-sm hover:bg-green-700 transition"
        >
          + Compose
        </button>

        {/* Tabs */}
        <button
          onClick={() => setActiveTab("scheduled")}
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm mb-1 ${
            activeTab === "scheduled"
              ? "bg-green-100 text-green-700 font-medium"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <FiClock />
          Scheduled
        </button>

        <button
          onClick={() => setActiveTab("sent")}
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
            activeTab === "sent"
              ? "bg-green-100 text-green-700 font-medium"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <FiSend />
          Sent
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-auto text-sm text-red-500 hover:underline"
        >
          Logout
        </button>
      </aside>

      {/* RIGHT CONTENT */}
      <main className="flex-1 flex flex-col">
        {/* Search bar */}
        <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
          <FiSearch className="text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab === "scheduled" ? "scheduled" : "sent"} emails`}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Email list */}
        <div className="flex-1 overflow-y-auto bg-white">
          {loading && (
            <div className="p-6 text-center text-gray-500">Loading emails...</div>
          )}

          {!loading && emails.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No {activeTab} emails yet
            </div>
          )}

          {emails.map((email) => (
            <div
              key={email.id}
              onClick={() => router.push(`/inbox/${email.id}`)}
              className="px-6 py-4 border-b hover:bg-gray-50 cursor-pointer flex items-center gap-4"
            >
              {/* Left: To */}
              <div className="min-w-[180px] text-sm font-medium text-gray-900">
                To: {email.recipient}
              </div>

              {/* Right content */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700 whitespace-nowrap">
                  <FiClock size={12} />
                  {email.scheduled_at
                    ? new Date(email.scheduled_at).toLocaleString()
                    : "Sent"}
                </div>

                <p className="text-sm truncate">
                  <span className="text-gray-900 font-medium">{email.subject}</span>
                  <span className="text-gray-400"> – {email.body}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
