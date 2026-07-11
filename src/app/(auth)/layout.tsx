export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="shell rounded-[32px] p-8 shadow-2xl w-full max-w-md">
        {children}
      </div>
    </div>
  );
}