import React, { useState } from "react";

export default function App() {
  const [codigo, setCodigo] = useState("");
  const [tipo, setTipo] = useState("");
  const [detalle, setDetalle] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tipo || !detalle.trim()) {
      setMensaje("Por favor, selecciona un servicio y proporciona detalles.");
      return;
    }

    const data = { codigo, tipo, detalle };

    try {
      const response = await fetch("/api/enviar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al enviar la solicitud.");
      }

      const result = await response.json();
      setMensaje(result.message);
      setCodigo("");
      setTipo("");
      setDetalle("");
    } catch (error) {
      setMensaje("Hubo un problema al enviar la solicitud. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4">Estación de Impresión ZiPrint</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Código del usuario (opcional)" className="w-full p-2 border rounded" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
          
          <select className="w-full p-2 border rounded" value={tipo} onChange={(e) => setTipo(e.target.value)} required>
            <option value="">Selecciona un servicio</option>
            <option value="Impresión">Impresión</option>
            <option value="Fotocopia">Fotocopia</option>
            <option value="Escaneo">Escaneo</option>
            <option value="Solicitud de ZiCard">Solicitar ZiCard</option>
          </select>

          <textarea placeholder="Detalles de la solicitud (cantidad, tipo, tamaño, etc.)" className="w-full p-2 border rounded" rows={4} value={detalle} onChange={(e) => setDetalle(e.target.value)} required />

          <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
            Enviar solicitud
          </button>
        </form>

        {mensaje && <p className="mt-4 text-green-600">{mensaje}</p>}
      </div>
    </div>
  );
}
