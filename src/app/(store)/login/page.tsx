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
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <Image src="/logo.png" alt="" width={72} height={72} className="mx-auto rounded-full" />
        <h1 className="mt-4 text-2xl font-bold text-navy">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to track orders and checkout faster
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <LoginForm />
      </div>
      {next && (
        <p className="mt-4 text-center text-xs text-slate-400">
          You&apos;ll be redirected to {next} after signing in
        </p>
      )}
      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/" className="text-cyan hover:underline">← Back to store</Link>
      </p>
    </div>
  );
}
