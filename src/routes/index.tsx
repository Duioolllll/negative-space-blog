import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "../components/ns/nav";
import { Hero } from "../components/ns/hero";
import { Featured } from "../components/ns/featured";
import { ContactSheet } from "../components/ns/contact-sheet";
import { Topics } from "../components/ns/topics";
import { About } from "../components/ns/about";
import { Letters } from "../components/ns/letters";
import { Footer } from "../components/ns/footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div id="top" className="ns-root">
      <Nav />
      <main>
        <Hero />
        <Featured />
        <ContactSheet />
        <Topics />
        <About />
        <Letters />
      </main>
      <Footer />
    </div>
  );
}
