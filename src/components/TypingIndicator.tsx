export default function TypingIndicator({ user }: { user: string }) {
  return user ? <p className="text-sm italic">{user} is typing...</p> : null;
}
