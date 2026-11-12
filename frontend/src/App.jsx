import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import DetailModal from "./components/DetailModal.jsx";
import Home from "./pages/Home.jsx";
import Browse from "./pages/Browse.jsx";
import Search from "./pages/Search.jsx";

export default function App() {
  const [selected, setSelected] = useState(null); // { id, media_type }

  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home onSelect={setSelected} />} />
          <Route path="/drama" element={<Browse key="drama" kind="drama" onSelect={setSelected} />} />
          <Route path="/variety" element={<Browse key="variety" kind="variety" onSelect={setSelected} />} />
          <Route path="/movie" element={<Browse key="movie" kind="movie" onSelect={setSelected} />} />
          <Route path="/anime" element={<Browse key="anime" kind="anime" onSelect={setSelected} />} />
          <Route path="/search" element={<Search onSelect={setSelected} />} />
        </Routes>
      </main>
      <Footer />
      {selected && (
        <DetailModal item={selected} onClose={() => setSelected(null)} onSelect={setSelected} />
      )}
    </>
  );
}
