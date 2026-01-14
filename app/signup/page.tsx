import { Suspense } from "react"
import { Logo } from "@/components/ui/logo"
import { SignupForm } from "@/components/auth"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        <Logo size="lg" />
      </div>
      <Suspense
        fallback={
          <div className="w-full max-w-sm h-96 bg-card border border-border rounded-xl animate-pulse" />
        }
      >
        <SignupForm />
      </Suspense>
    </div>
  )
}
