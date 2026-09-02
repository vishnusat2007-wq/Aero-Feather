import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-af-cyan/30 bg-af-cyan/10">
        <CheckCircle className="h-8 w-8 text-af-cyan" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-af-text">Thank you for your order</h1>
      <p className="mt-4 text-af-muted">
        Your payment was successful. We&apos;ll send a confirmation email shortly and
        dispatch your shuttlecocks within 24 hours.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Button variant="primary" asChild>
          <Link href="/account">View orders</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}
