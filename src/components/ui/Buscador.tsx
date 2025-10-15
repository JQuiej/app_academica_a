"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function Buscador() {
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    window.open(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, "_blank");
  }

  return (
    <div className="flex justify-center items-center min-h-[70vh] bg-gradient-to-b from-white to-gray-100">
      <div className="w-full max-w-2xl text-center">
        {/* Logo estilo Bing */}
        <h1 className="text-4xl font-bold text-blue-600 mb-8">Bing</h1>

        {/* Caja de búsqueda */}
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-white border border-gray-300 rounded-full shadow-md overflow-hidden"
        >
          <Search className="ml-3 text-gray-500 h-5 w-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en Bing..."
            className="flex-1 px-3 py-3 text-lg outline-none"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-medium"
          >
            Buscar
          </button>
        </form>
      </div>
    </div>
  );
}