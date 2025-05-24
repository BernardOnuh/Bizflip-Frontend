import Image from "next/image";
import { Inter } from "next/font/google";
import Dox from "@/components/Dox/dox";
import Header from "@/components/Header";
const inter = Inter({ subsets: ["latin"] });

export default function dox() {
  return (
    <div className="">
      <Header/>
     <Dox/>
    </div>
  ); 
}
