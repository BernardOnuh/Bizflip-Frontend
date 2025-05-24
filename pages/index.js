import Image from "next/image";
import Header from "@/components/Header";
import Hero from "@/components/Hero/Hero";
import Chat from "@/components/Chatbox/chat";
export default function Home() {
  return (
    <div
    >
      <Header/>
      <Hero/>
      <Chat/>
    </div>
  );
}
