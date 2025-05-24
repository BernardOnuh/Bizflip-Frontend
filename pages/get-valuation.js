import Image from "next/image";
import Header from "@/components/Header";
import QnA from "@/components/Qna";
import Valuation from "@/components/Valuation";
import Chat from "@/components/Chatbox/chat";
export default function Home() {
  return (
    <div
    >
      <Header/>
      <Valuation/>
      <Chat/>
    </div>
  );
}
