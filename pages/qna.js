import Image from "next/image";
import Header from "@/components/Header";
import QnA from "@/components/Qna";
import Chat from "@/components/Chatbox/chat";
export default function Home() {
  return (
    <div
    >
      <Header/>
      <QnA/>
      <Chat/>
    </div>
  );
}
