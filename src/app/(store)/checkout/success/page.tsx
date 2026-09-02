import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-cyan/15">
        <CheckCircle className="h-8 w-8 text-cyan" />
      </div>
      <h1 className="text-3xl font-bold text-navy">Thank you for your order!</h1>
      <p className="mt-4 text-slate-600">
        Your payment was successful. We&apos;ll send a confirmation email shortly and
        dispatch your shuttlecocks within 24 hours.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button variant="cyan" asChild>
          <Link href="/account">View orders</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}
