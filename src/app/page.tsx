import ApiDocs from "@/components/ApiDocs";
import AskPanel from "@/components/AskPanel";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import StatsStrip from "@/components/StatsStrip";
import StudentsConsole from "@/components/StudentsConsole";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <Nav />
      <Hero />
      <StatsStrip />
      <StudentsConsole />
      <AskPanel />
      <ApiDocs />
      <Footer />
    </main>
  );
}
