"use client";
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {

const router = useRouter()
  const { login, loading, error } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    const success = await login(email, password)
    if (success) router.push("/inbox")

    }









  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-[380px] bg-white rounded-xl shadow-md px-8 py-10">
        
        {/* Title */}
        <h1 className="text-2xl font-semibold text-center text-gray-900">
          Login
        </h1>

        {/* Google Login */}
        <button
           onClick={() => signIn("google", { callbackUrl: "/inbox" })}
        
          className="mt-6 w-full flex items-center justify-center gap-2 bg-green-100 text-green-800 py-2.5 rounded-md font-medium hover:bg-green-200 transition"
        >
          Login with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">
            or sign up through email
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Email */}
        <input
          type="email"
          placeholder="Email ID"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
           value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-5 px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
        />

        {/* Login Button */}
        <button  onClick={handleLogin} disabled={loading}
        
          className="w-full bg-green-600 text-white py-2.5 rounded-md font-medium hover:bg-green-700 transition"
        > {loading ? "Logging in..." : "Login"}
          
        </button>

         {error && <p className="text-red-500 mt-2">{error}</p>}

         
      </div>
    </div>
  );
}
