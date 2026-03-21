import { useState } from "react";
import JoinScreen from "./components/JoinScreen";
import WhiteboardApp from "./components/WhiteboardApp";
import "./styles/global.css";

export default function App() {
  const [session, setSession] = useState(null);

  return session ? (
    <WhiteboardApp session={session} onLeave={() => setSession(null)} />
  ) : (
    <JoinScreen onJoin={setSession} />
  );
}
