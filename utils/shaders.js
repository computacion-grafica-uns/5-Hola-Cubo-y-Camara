export const vertexShaderSourceCode = `#version 300 es

  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;

  in vec3 vertexPosition;
  in vec3 vertexColor;

  out vec3 color;

  void main() {
    color = vertexColor;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(vertexPosition, 1);
  }
`

export const fragmentShaderSourceCode = `#version 300 es
  precision mediump float;

  in vec3 color;

  out vec4 fragmentColor;

  void main() {
    fragmentColor = vec4(color, 1);
  }
`