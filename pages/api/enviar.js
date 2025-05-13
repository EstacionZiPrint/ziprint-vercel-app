import fs from 'fs';
import path from 'path';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const fromWhatsApp = 'whatsapp:+14155238886';
const toWhatsApp = 'whatsapp:+50374155626';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const { codigo, tipo, detalle } = req.body;
  const fecha = new Date().toISOString();

  const mensaje = `Solicitud ZiPrint\nCódigo: ${codigo || 'No proporcionado'}\nServicio: ${tipo}\nDetalle: ${detalle}\nFecha: ${fecha}`;

  const registroJSON = { codigo, tipo, detalle, fecha };

  const jsonPath = path.join(process.cwd(), 'solicitudes.json');
  const txtPath = path.join(process.cwd(), 'solicitudes.txt');

  try {
    let data = [];
    if (fs.existsSync(jsonPath)) {
      const file = fs.readFileSync(jsonPath);
      data = JSON.parse(file);
    }
    data.push(registroJSON);
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    fs.appendFileSync(txtPath, `\n${mensaje}\n------------------------\n`);

    await client.messages.create({
      from: fromWhatsApp,
      to: toWhatsApp,
      body: mensaje,
    });

    res.status(200).json({ message: 'Solicitud enviada con éxito.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error al enviar la solicitud.' });
  }
}
