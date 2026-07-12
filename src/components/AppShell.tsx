import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CuelumeSounds from "@/components/CuelumeSounds";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CuelumeSounds />
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">
        {children}
      </main>
      <Footer />
    </>
  );
}
