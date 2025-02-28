// "use client";
// import dynamic from "next/dynamic";

// const Login = dynamic(() => import("./components/Login"), { ssr: false });

// export default function Home() {
//   return (
//     <div>
//     <h1>Web3 Multi Wallet Connect</h1>
//     <Login />
//   </div>
//   );
// }

"use client";
import dynamic from "next/dynamic";

const Login = dynamic(() => import("./components/Login"), { ssr: false });

export default function Home() {
  return (
    <div>
      <h1>Web3Auth Multi-Wallet Login</h1>
      <Login />
    </div>
  );
}
