import Image from "next/image";
import Header from "@/components/Header";
import BrokerPage from "@/components/Broker";
import Chat from "@/components/Chatbox/chat";
export default function Home() {
  return (
    <div
    >
      <Header/>
      <BrokerPage/>
      <Chat/>
    </div>
  );
}
