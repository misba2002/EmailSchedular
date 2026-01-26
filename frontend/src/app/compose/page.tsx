"use client";

import { sendEmail } from "@/services/email";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiUpload, FiClock, FiArrowLeft } from "react-icons/fi";
import { useSession } from "next-auth/react";
import Papa from "papaparse";

export default function ComposePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [delay, setDelay] = useState("00");
  const [hourlyLimit, setHourlyLimit] = useState("00");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [sendLaterDate, setSendLaterDate] = useState<Date | null>(null);

  // 🔒 Protect page: redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading session...
      </div>
    );
  }

  // Add individual recipient
  const handleAddRecipient = () => {
    if (email && !recipients.includes(email)) {
      setRecipients([...recipients, email]);
      setEmail("");
    }
  };

  // Remove recipient
  const removeRecipient = (recipientToRemove: string) => {
    setRecipients(recipients.filter((r) => r !== recipientToRemove));
  };

  // Handle file upload (CSV or TXT)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;

      if (file.name.endsWith(".csv")) {
        const parsed = Papa.parse(text, { header: false });
        const emailsFromCSV = parsed.data
          .flat()
          .map((e) => (typeof e === "string" ? e.trim() : ""))
          .filter((e) => e && !recipients.includes(e));
        setRecipients((prev) => [...prev, ...emailsFromCSV]);
      } else {
        const emailsFromText = text
          .split("\n")
          .map((e) => e.trim())
          .filter((e) => e && !recipients.includes(e));
        setRecipients((prev) => [...prev, ...emailsFromText]);
      }
    };
    reader.readAsText(file);

    e.target.value = ""; // reset input
  };

  const handleSend = async () => {
    if (recipients.length === 0) {
      alert("Add at least one recipient!");
      return;
    }

    try {
      const result = await sendEmail({
        recipients,
        subject,
        body,
        scheduledAt: sendLaterDate?.toISOString(),
        delay: Number(delay),
        hourlyLimit: Number(hourlyLimit),
      });
      console.log("Email scheduled:", result);
      alert("Email scheduled successfully!");
      router.push("/inbox");
    } catch (err) {
      console.error(err);
      alert("Failed to schedule email");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-md hover:bg-gray-100 transition border"
            >
              <FiArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Compose New Email
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Upload File */}
            <label className="p-2 rounded-md hover:bg-gray-100 transition border cursor-pointer flex items-center gap-1">
              <FiUpload size={20} />
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Scheduler */}
            <DatePicker
              selected={sendLaterDate}
              onChange={(date: Date | null) => setSendLaterDate(date)}
              showTimeSelect
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              customInput={
                <button className="p-2 rounded-md hover:bg-gray-100 transition border flex items-center gap-1">
                  <FiClock size={20} />
                </button>
              }
              popperPlacement="bottom-end"
            />

            {/* Send */}
            <button
              onClick={handleSend}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Send
            </button>
          </div>
        </div>

        {/* From */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From
          </label>
          <span className="px-4 py-2 border rounded-lg bg-gray-100 w-full text-gray-700">
            {session?.user?.email}
          </span>
        </div>

        {/* To */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {recipients.map((recipient, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full text-sm text-blue-800"
              >
                {recipient}
                <button
                  onClick={() => removeRecipient(recipient)}
                  className="hover:text-blue-900 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Add recipient email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              onKeyDown={(e) => e.key === "Enter" && handleAddRecipient()}
            />
            <button
              onClick={handleAddRecipient}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Add
            </button>
          </div>
          {recipients.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {recipients.length} email(s) added
            </p>
          )}
        </div>

        {/* Subject */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delay between 2 emails
            </label>
            <input
              type="text"
              value={delay}
              onChange={(e) => setDelay(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hourly Limit
            </label>
            <input
              type="text"
              value={hourlyLimit}
              onChange={(e) => setHourlyLimit(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="00"
            />
          </div>
        </div>

        {/* Body */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type Your Reply...
          </label>
          <textarea
            placeholder="Start typing your email here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full h-56 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
