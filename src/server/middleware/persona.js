
export default class Persona {
  constructor(nombre, peso, altura) {
    this.nombre = nombre;
    this.peso = peso;
    this.altura = altura;
  }

  // Método para validar los datos de la persona
  validar() {
    if (!this.nombre || isNaN(this.peso) || isNaN(this.altura)) {
      throw new Error('Datos inválidos');
    }
  }
}

