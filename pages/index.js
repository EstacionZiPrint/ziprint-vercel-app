// Frontend: React (app.jsx)
import React, { useState } from "react";

export default function App() {
  const [codigo, setCodigo] = useState("");
  const [tipo, setTipo] = useState("");
  const [detalle, setDetalle] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      codigo,
      tipo,
      detalle,
    };

    const response = await fetch("/api/enviar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    setMensaje(result.message);
    setCodigo("");
    setTipo("");
    setDetalle("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4">Estación de Impresión ZiPrint</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Código del usuario (opcional)"
            className="w-full p-2 border rounded"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />

          <select
            className="w-full p-2 border rounded"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            required
          >
            <option value="">Selecciona un servicio</option>
            <option value="Impresión">Impresión</option>
            <option value="Fotocopia">Fotocopia</option>
            <option value="Escaneo">Escaneo</option>
            <option value="Solicitud de ZiCard">Solicitar ZiCard</option>
          </select>

          <textarea
            placeholder="Detalles de la solicitud (cantidad, tipo, tamaño, etc.)"
            className="w-full p-2 border rounded"
            rows={4}
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            required
          ></textarea>

          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Enviar solicitud
          </button>
        </form>

        {mensaje && <p className="mt-4 text-green-600">{mensaje}</p>}
      </div>
    </div>
  );
}

// Backend: Node.js (api/enviar.js)
const express = require('express');
const fs = require('fs');
const path = require('path');
const twilio = require('twilio');
const router = express.Router();

// Twilio config
const accountSid = 'TU_ACCOUNT_SID';
const authToken = 'TU_AUTH_TOKEN';
const client = twilio(accountSid, authToken);
const fromWhatsApp = 'whatsapp:+14155238886'; // Número de Twilio
const toWhatsApp = 'whatsapp:+50374155626'; // Tu número de WhatsApp

router.post('/enviar', async (req, res) => {
  const { codigo, tipo, detalle } = req.body;
  const fecha = new Date().toISOString();

  const mensaje = `Solicitud ZiPrint\nCódigo: ${codigo || 'No proporcionado'}\nServicio: ${tipo}\nDetalle: ${detalle}\nFecha: ${fecha}`;

  // Guardar como JSON
  const registroJSON = {
    codigo,
    tipo,
    detalle,
    fecha,
  };

  const jsonPath = path.join(__dirname, 'solicitudes.json');
  const txtPath = path.join(__dirname, 'solicitudes.txt');

  try {
    // Guardar en archivo .json
    let data = [];
    if (fs.existsSync(jsonPath)) {
      const file = fs.readFileSync(jsonPath);
      data = JSON.parse(file);
    }
    data.push(registroJSON);
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

    // Guardar en archivo .txt
    fs.appendFileSync(txtPath, `\n${mensaje}\n------------------------\n`);

    // Enviar mensaje a WhatsApp
    await client.messages.create({
      from: fromWhatsApp,
      to: toWhatsApp,
      body: mensaje,
    });

    res.json({ message: 'Solicitud enviada con éxito.' });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ message: 'Error al enviar la solicitud.' });
  }
});

module.exports = router;
