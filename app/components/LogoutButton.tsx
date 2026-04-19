"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const { error } = await authClient.signOut();
    if (!error) {
      router.push("/authentication");
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="cursor-pointer text-sm text-neutral-500 hover:text-foreground transition-colors"
    >
      Sign out
    </button>
  );
}
