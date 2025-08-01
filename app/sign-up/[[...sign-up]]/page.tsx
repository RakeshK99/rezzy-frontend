// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black">
      <SignIn />
      <Link href="/" className="text-white mt-4 underline hover:text-pink-500">
        ← Back to homepage
      </Link>
    </div>
  );
}
