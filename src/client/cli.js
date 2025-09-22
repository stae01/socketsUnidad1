import net from 'node:net';
import readline from 'node:readline';
import yaml from 'js-yaml';

// Configuración de conexión (puedes cambiar host/puerto si el servidor no es local)
const HOST = process.env.BMI_HOST || '127.0.0.1';
const PORT = Number(process.env.BMI_PORT || 4000);

// ========== Funciones ayuda ==========
function ask(q) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(res => rl.question(q, ans => { rl.close(); res(ans); }));
}

function objectToYamlBuffer(obj) {
  const text = yaml.dump(obj, { noRefs: true });
  return Buffer.from(text, 'utf8');
}

function yamlBufferToObject(buf) {
  const text = Buffer.from(buf).toString('utf8');
  return yaml.load(text);
}

function writeFrame(socket, bytes) {
  const header = Buffer.alloc(4);
  header.writeUInt32BE(bytes.length, 0);
  socket.write(Buffer.concat([header, bytes]));
}

function readOneFrame(socket) {
  return new Promise((resolve, reject) => {
    let buffer = Buffer.alloc(0);
    function onData(chunk) {
      buffer = Buffer.concat([buffer, chunk]);
      if (buffer.length >= 4) {
        const len = buffer.readUInt32BE(0);
        if (buffer.length >= 4 + len) {
          socket.off('data', onData);
          const payload = buffer.subarray(4, 4 + len);
          resolve(payload);
        }
      }
    }
    socket.on('data', onData);
    socket.on('error', reject);
  });
}

function printBox(title, lines) {
  const width = Math.max(title.length, ...lines.map(l => l.length)) + 4;
  const hr = '─'.repeat(width);
  const pad = s => '│ ' + s.padEnd(width - 4, ' ') + ' │';
  console.log(`\n┌${hr}┐`);
  console.log(pad(title));
  console.log('├' + '─'.repeat(width) + '┤');
  lines.forEach(l => console.log(pad(l)));
  console.log(`└${hr}┘\n`);
}

// ========== Programa principal ==========
(async () => {
  try {
    const nombre = (await ask('Nombre: ')).trim();
    const peso = Number((await ask('Peso (kg): ')).trim());
    const altura = Number((await ask('Altura (m): ')).trim());

    const person = { nombre, peso, altura };
    const yamlBytes = objectToYamlBuffer(person);

    // Conectar al servidor
    const socket = net.createConnection({ host: HOST, port: PORT }, () => {
      writeFrame(socket, yamlBytes);
    });

    // Esperar respuesta
    const payload = await readOneFrame(socket);
    socket.end();

    // Parsear YAML de respuesta
    const doc = yamlBufferToObject(payload) ?? {};
    const r = doc.ResultadoIMC ?? {};
    const persona = r.Persona ?? {};
    const bmi = r.BMI ?? null;
    const categoria = r.Categoria ?? r.Error ?? 'N/A';

    // Mostrar “GUI” en consola
    printBox('Resultado IMC', [
      `Nombre: ${persona.nombre ?? nombre}`,
      `Peso (kg): ${persona.pesoKg ?? peso}`,
      `Altura (m): ${persona.alturaM ?? altura}`,
      `BMI: ${bmi}`,
      `Categoría: ${categoria}`
    ]);

    console.log('YAML recibido del servidor:\n');
    console.log(Buffer.from(payload).toString('utf8'));
  } catch (e) {
    console.error('Error en cliente:', e?.message || e);
    process.exit(1);
  }
})();
