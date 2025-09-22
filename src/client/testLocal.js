import fs from "fs";
import yaml from "js-yaml";

function printBox(title, lines) {
  const width = Math.max(title.length, ...lines.map(l => l.length)) + 4;
  const hr = "─".repeat(width);
  const pad = s => "│ " + s.padEnd(width - 4, " ") + " │";
  console.log(`\n┌${hr}┐`);
  console.log(pad(title));
  console.log("├" + "─".repeat(width) + "┤");
  lines.forEach(l => console.log(pad(l)));
  console.log(`└${hr}┘\n`);
}

// Leer YAML de prueba
const text = fs.readFileSync("test/respuesta.yaml", "utf8");
const doc = yaml.load(text);

const r = doc.ResultadoIMC ?? {};
const persona = r.Persona ?? {};
const bmi = r.BMI ?? null;
const categoria = r.Categoria ?? "N/A";

printBox("Resultado IMC", [
  `Nombre: ${persona.nombre}`,
  `Peso (kg): ${persona.pesoKg}`,
  `Altura (m): ${persona.alturaM}`,
  `BMI: ${bmi}`,
  `Categoría: ${categoria}`
]);

console.log("YAML simulado recibido:\n");
console.log(text);
