// apps/rider/src/app/(auth)/layout.tsx
import Image from "next/image";
import type { ReactNode } from "react";
import { LanguageSwitch } from "@/components/common/LanguageSwitch";

/** Shared frame for the logged-out screens: language switch + logo. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="pt-safe mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-8">
      <header className="flex justify-end pt-4">
        <LanguageSwitch />
      </header>

      <div className="flex flex-1 flex-col justify-center gap-6 py-6">
        <div className="flex justify-center">
          {/* White logo background blends into the cream page (multiply) */}
          <Image
            src="/logo/logo-480.webp"
            alt="MyStreetMenu - Your Menu. Everywhere."
            width={480}
            height={416}
            priority
            unoptimized
            className="h-auto w-48 mix-blend-multiply"
          />
        </div>

        {children}
      </div>
    </main>
  );
}
