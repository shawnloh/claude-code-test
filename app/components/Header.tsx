import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function Header() {
  return (
    <header className="border-b border-neutral-200 bg-background">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-lg font-semibold text-foreground hover:opacity-80 transition-opacity"
        >
          NextNotes
        </Link>
        <LogoutButton />
      </div>
    </header>
  );
}
