"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage("")
    setIsPending(true)

    // Basic email validation: must contain '@'
    if (!email.includes("@")) {
      setMessage("Email must contain an '@' symbol.")
      setIsPending(false)
      return
    }

    // Simulate form submission delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Simulate successful login and redirect to main site
    if (typeof window !== "undefined") {
      localStorage.setItem("isLoggedIn", "true")
    }
    setMessage("Redirecting to main site...")
    router.push("/")
    setIsPending(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Login</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="auth-input"
            placeholder="your@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="auth-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" disabled={isPending} className="auth-button">
            {isPending ? "Processing..." : "Sign In"}
          </button>
          {message && (
            <p className={message.includes("Email must contain") ? "auth-error" : "auth-message"}>{message}</p>
          )}
        </form>
        <p className="auth-link-text">
          Don't have an account?{" "}
          <Link href="/signup" className="auth-link">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
