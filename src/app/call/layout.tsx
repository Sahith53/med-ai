export default function CallLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="h-screen bg-black">{children}</div>;
}
