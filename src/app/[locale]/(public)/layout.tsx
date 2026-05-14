import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { DemoBanner } from "@/components/demo-banner";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
