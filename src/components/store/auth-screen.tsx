import type { ReactNode } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/store/logo";

type Props = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthScreen({ title, description, children, footer }: Props) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-[22rem] flex-col justify-center px-4 py-16 sm:max-w-sm">
      <div className="mb-8 text-center">
        <LogoMark size={64} glow className="mx-auto" />
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-af-text">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-af-muted">{description}</p>
      </div>
      {children}
      {footer ? <div className="mt-8 text-center text-sm text-af-muted">{footer}</div> : null}
    </div>
  );
}

export function AuthFooterLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="text-af-cyan transition-colors hover:text-af-text">
      {children}
    </Link>
  );
}
