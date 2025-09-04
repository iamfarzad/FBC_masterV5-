"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
// import { Alert, AlertDescription } from "@/components/ui/alert" // Component removed
import { Loader2, Shield } from "lucide-react"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        router.push("/admin")
      } else {
        const data: { error?: string } = await response.json()
        setError(data.error || "Invalid password")
      }
    } catch {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="card-glass w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-accent/10 mx-auto flex size-12 items-center justify-center rounded-full">
            <Shield className="size-6 text-accent" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold text-foreground">F.B/c AI Admin</CardTitle>
          <CardDescription className="text-muted-foreground">Enter your admin password to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-enhanced mt-1"
                placeholder="Enter admin password"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border-destructive/30 rounded-lg border p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="btn-primary w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
