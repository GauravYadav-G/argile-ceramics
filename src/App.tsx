import { Cursor, ScrollBar, SmoothScroll } from "./lib/shell";
import Argile from "./Argile";

export default function App() {
  return (
    <>
      <SmoothScroll />
      <Cursor />
      <ScrollBar tone="#b4532f" />
      <Argile />
    </>
  );
}
