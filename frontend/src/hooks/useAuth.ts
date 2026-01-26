"use client"

import { useState } from "react"
import { loginUser } from "@/services/auth"

export const useAuth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      const res = await loginUser(email, password)
      localStorage.setItem("token", res.token)

      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { login, loading, error }
}
