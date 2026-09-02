import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/components/store/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <Image src="/logo.png" alt="" width={64} height={64} className="mx-auto" />
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-af-text">Welcome back</h1>
        <p className="mt-2 text-sm text-af-muted">
          Sign in to track orders and checkout faster
        </p>
      </div>
      <div className="border border-af-cyan/15 bg-af-surface p-8">
        <LoginForm />
      </div>
      {next && (
        <p className="mt-4 text-center text-xs text-af-muted">
          You&apos;ll be redirected to {next} after signing in
        </p>
      )}
      <p className="mt-6 text-center text-sm text-af-muted">
        <Link href="/" className="text-af-cyan transition-colors hover:text-af-text">
          ← Back to store
        </Link>
      </p>
    </div>
  );
}
