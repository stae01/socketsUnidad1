import net from 'net';
import yaml from 'js-yaml';
import { procesarIMC } from './middleware/imc.js';

const PORT = process.env.BMI_PORT || 4000;

function readFrame(socket, onFrame) {
  let buffer = Buffer.alloc(0);
  socket.on('data', chunk => {
    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length >= 4) {
      const len = buffer.readUInt32BE(0);
      if (buffer.length >= 4 + len) {
        const payload = buffer.subarray(4, 4 + len);
        onFrame(payload);
        buffer = buffer.subarray(4 + len);
      } else break;
    }
  });
}

function writeFrame(socket, obj) {
  const yamlStr = yaml.dump(obj, { noRefs: true });
  const bytes = Buffer.from(yamlStr, 'utf8');
  const header = Buffer.alloc(4);
  header.writeUInt32BE(bytes.length, 0);
  socket.write(Buffer.concat([header, bytes]));
}

const server = net.createServer(socket => {
  const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`[${clientId}] Conectado`);

  readFrame(socket, payload => {
    console.log(`[${clientId}] YAML recibido:\n${payload.toString('utf8')}`);

    const resultado = procesarIMC(payload);

    console.log(`[${clientId}] Resultado calculado:\n${yaml.dump(resultado)}`);
    writeFrame(socket, resultado);
  });

  socket.on('end', () => console.log(`[${clientId}] Desconectado`));
  socket.on('error', err => console.error(`[${clientId}] Error socket: ${err.message}`));
});

server.listen(PORT, () => console.log(`Servidor TCP escuchando en puerto ${PORT}`));
