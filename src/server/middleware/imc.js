

import yaml from 'js-yaml'; 
import Persona from './persona.js';

function calcularIMC(peso, altura) {
  return peso / (altura * altura);
}

function clasificarIMC(imc) {
  if (imc < 18.5) return 'Bajo peso';
  else if (imc < 24.9) return 'Normal';
  else if (imc < 29.9) return 'Sobrepeso';
  else return 'Obesidad';
}

export function procesarIMC(yamlBytes) {
  try {
    const data = yaml.load(yamlBytes.toString('utf8'));  
    const persona = new Persona(data.nombre, data.peso, data.altura);  // Instanciamos la clase Persona
    persona.validar();  // Validamos los datos

    // Calculamos el IMC
    const imc = calcularIMC(persona.peso, persona.altura);
    const clasificacion = clasificarIMC(imc);

    // Devolvemos el resultado con la estructura esperada por el cliente
    return {
      ResultadoIMC: {
        Persona: {
          nombre: persona.nombre,
          pesoKg: persona.peso,
          alturaM: persona.altura
        },
        BMI: imc.toFixed(2),      // IMC calculado
        Categoria: clasificacion // Clasificación según IMC
      }
    };
  } catch (error) {
    return { error: error.message }; 
  }
}

