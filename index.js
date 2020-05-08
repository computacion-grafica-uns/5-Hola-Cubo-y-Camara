import { getCanvasElement, getWebGL2Context, createShader, createProgram, createVertexBuffer, bindAttributeToVertexBuffer, createIndexBuffer, magic } from "./utils/gl-utils.js"
import { vertexShaderSourceCode, fragmentShaderSourceCode } from "./utils/shaders.js"
import { mat4, glMatrix } from './utils/gl-matrix/index.js'

// #️⃣ Configuración base de WebGL

const canvas = getCanvasElement('canvas')
const gl = getWebGL2Context(canvas)

gl.clearColor(0, 0, 0, 1)
gl.enable(gl.DEPTH_TEST)

// #️⃣ Creamos los shaders, el programa que vamos a usar, y guardamos info de sus inputs (atributos y uniforms)

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSourceCode)
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSourceCode)
const program = createProgram(gl, vertexShader, fragmentShader)

const vertexPositionLocation = gl.getAttribLocation(program, 'vertexPosition')
const vertexColorLocation = gl.getAttribLocation(program, 'vertexColor')
const modelMatrixLocation = gl.getUniformLocation(program, 'modelMatrix')

// #️⃣ Definimos la info de la geometría que vamos a dibujar

const vertexPositions = [
  -1, 1, 1,
  1, 1, 1,
  1, 1, -1,
  -1, 1, -1,
  -1, -1, 1,
  1, -1, 1,
  1, -1, -1,
  -1, -1, -1
]

const vertexColors = [
  1, 0, 1,
  1, 1, 1,
  0, 1, 1,
  0, 0, 1,
  1, 0, 0,
  1, 1, 0,
  0, 1, 0,
  0, 0, 0
]

const indices = [
  0, 1, 3, 3, 1, 2,
  7, 5, 4, 5, 7, 6,
  3, 4, 0, 3, 7, 4,
  5, 2, 1, 5, 6, 2,
  4, 1, 0, 4, 5, 1,
  6, 3, 2, 6, 7, 3,
]

// #️⃣ Guardamos la info de la geometría en VBOs e IBO

const vertexPositionsBuffer = createVertexBuffer(gl, vertexPositions)
const vertexColorsBuffer = createVertexBuffer(gl, vertexColors)
const indexBuffer = createIndexBuffer(gl, indices)

// #️⃣ Asociamos los atributos del programa a los buffers creados, y establecemos el buffer de indices a usar

const vertexArray = gl.createVertexArray()
gl.bindVertexArray(vertexArray)
gl.enableVertexAttribArray(vertexPositionLocation)
bindAttributeToVertexBuffer(gl, vertexPositionLocation, 3, vertexPositionsBuffer)
gl.enableVertexAttribArray(vertexColorLocation)
bindAttributeToVertexBuffer(gl, vertexColorLocation, 3, vertexColorsBuffer)
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
gl.bindVertexArray(null)

// #️⃣ Creamos las matrices que vamos a estar usando y valores que vamos a usar para inicializarlas

const translationMatrix = mat4.create()
const scaleMatrix = mat4.create()
const rotationMatrix = mat4.create()
const modelMatrix = mat4.create()

let translation = 0
let scale = 1
let rotation = 0

// Definimos una velocidad de rotación (en grados por segundo)
const rotationSpeed = 20

// #️⃣ Establecemos el programa a usar, sus conexiónes atributo-buffer e indices a usar (guardado en el VAO)

gl.useProgram(program)
gl.bindVertexArray(vertexArray)

// ✨ Magia (que en breve veremos que hace. Spoiler: configura la cámara)
magic(gl, program, canvas)

// #️⃣ Dibujamos la escena

let previousTime = 0

function render(currentTime) {
  // Calculamos el incremento en rotación a partir del tiempo desde el ultimo frame y la velocidad de rotación
  const timeDelta = (currentTime - previousTime) / 1000
  const rotationDelta = timeDelta * rotationSpeed

  // El nuevo angulo es el anterior + el incremento calculado (acotado al rango [0, 360])
  rotation += rotationDelta
  rotation %= 360

  // Actualizamos matrices de traslación, escalado y rotación (en este caso solo va a ir cambiando la de rotación)
  mat4.fromTranslation(translationMatrix, [translation, 0, 0])
  mat4.fromScaling(scaleMatrix, [scale, scale, 1])
  mat4.fromRotation(rotationMatrix, glMatrix.toRadian(rotation), [0, 0, 1])

  // "Reseteamos" la modelMatrix y le aplicamos las transformaciones
  mat4.identity(modelMatrix)
  mat4.multiply(modelMatrix, scaleMatrix, modelMatrix)
  mat4.multiply(modelMatrix, rotationMatrix, modelMatrix)
  mat4.multiply(modelMatrix, translationMatrix, modelMatrix)

  // Actualizamos el valor del uniform correspondiente a la modelMatrix
  gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix)

  // Limpiamos el canvas y dibujamos
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)

  // Guardamos el momento en que se dibujo este frame y solicitamos el proximo
  previousTime = currentTime
  requestAnimationFrame(render)
}

// Nuestro primer frame
requestAnimationFrame(render)
