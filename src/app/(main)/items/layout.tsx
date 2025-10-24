export const dynamic = "force-dynamic";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-grow h-full">
      {children}
    </div>
  );
}