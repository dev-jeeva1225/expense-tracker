import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Navigation user={{ name: session.user.name ?? "", email: session.user.email ?? "" }} />
      <main className="flex-1 md:ml-60 pb-20 md:pb-0">
        <div className="max-w-3xl mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
