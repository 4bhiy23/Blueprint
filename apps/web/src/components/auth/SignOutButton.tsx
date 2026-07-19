"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();

    router.replace("/login");
  }

  return (
    <button onClick={handleSignOut}>
      Sign out
    </button>
  );
}