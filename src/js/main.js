import { getVertexShader, getFragmentShader } from './utils.js'

// Global variables that are set and used
// across the application
let gl
let program
let squareVertexBuffer
let widthLoc
let heightLoc
const canvas = document.getElementById('webgl-canvas')

// We call draw to render to our canvas
function draw() {
  // Clear the scene
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexBuffer);
  gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
  // GLuint index: index of the generic vertex attribute
  // GLint size: number of components per generic vertex attribute, 1~4
  // GLenum type: data type of each component in the array
  // GLboolean normalized: 
  // GLsizei stride: byte offset between consecutive generic vertex attributes
  // const void * pointer: offset of the first component of the first generic vertex attribute in the array
  gl.enableVertexAttribArray(program.aVertexPosition);
  // GLuint index: index of the generic vertex attribute to be enabled

  // Draw to the scene using triangle primitives from array data
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  // GLenum mode: primitive type
  // GLint first: starting index
  // GLsizei count: number of indices

  // Clean
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

// Entry point to our application
function init() {
  // Retrieve the canvas

  // Set the canvas to the size of the screen
  canvas.width = 100; // window.innerWidth;
  canvas.height = 20; // window.innerHeight;

  // Retrieve a WebGL context
  gl = canvas.getContext('webgl2', {preserveDrawingBuffer: true}) // , {preserveDrawingBuffer: true}
  // Set the clear color to be black
  gl.clearColor(0, 0, 0, 1);

  // Call the functions in an appropriate order
  const vertexShader = getVertexShader(gl);
  const fragmentShader = getFragmentShader(gl);

  // Create a program
  program = gl.createProgram();
  // Attach the shaders to this program
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Could not initialize shaders');
  }

  // Use this program instance
  gl.useProgram(program);
  // We attach the location of these shader values to the program instance
  // for easy access later in the code
  program.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
  program.aVertexColorAttribute = gl.getAttribLocation(program, "aVertexColor");

  // camera = new Camera();
  // camera.setPosition(0.0, 0.0, 10.0);
  // program.uCameraMatrix = gl.getUniformLocation(program, 'uCameraMatrix');
  // gl.uniformMatrix4fv(program.uCameraMatrix, false, camera.matrix);

  const { width, height } = canvas;
  program.uInverseTextureSize = gl.getUniformLocation(program, 'uInverseTextureSize');
  gl.uniform2f(program.uInverseTextureSize, 1/width, 1/height);
  console.log('width', width);
  console.log('height', height);
  // time = new Date().getTime() * 0.0001
  // console.log('time', time);
  // uniformLoc = gl.getUniformLocation(program, 'uTime');
  // gl.uniform1f(uniformLoc, time - Math.floor(time));
  
  // init buffer for the ray tracing
  /*
    (-1, 1, 0)        (1, 1, 0)
    X---------------------X
    |                     |
    |                     |
    |       (0, 0)        |
    |                     |
    |                     |
    X---------------------X
    (-1, -1, 0)       (1, -1, 0)
  */
  const vertices = [
    -1, -1, 0,
    1, -1, 0,
    -1, 1, 0,
    -1, 1, 0,
    1, -1, 0,
    1, 1, 0
  ]

  // Init the VBO
  squareVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Clean up the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  widthLoc = gl.getUniformLocation(program, 'uWidth');
  gl.uniform1i(widthLoc, canvas.width);
  heightLoc = gl.getUniformLocation(program, 'uHeight');
  gl.uniform1i(heightLoc, canvas.height);
  
  // draw geometry
  draw();

  let pixels;
  let vf;

  pixels = new Uint8Array(gl.drawingBufferWidth * 10 * 4);
  gl.readPixels(0, 0, gl.drawingBufferWidth, 10, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  vf = new Uint32Array(pixels.buffer);
  console.log(vf);

  pixels = new Uint8Array(gl.drawingBufferWidth * 10 * 4);
  gl.readPixels(0, 10, gl.drawingBufferWidth, 10, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  vf = new Float32Array(pixels.buffer);
  console.log(vf);
}

function readUint32Array() {
  let pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
  gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  return new Uint32Array(pixels.buffer);
}

function readFloat32Array() {
  let pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
  gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  return new Float32Array(pixels.buffer);
}

function readInt32Array() {
  let pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
  gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  return new Int32Array(pixels.buffer);
}

// Call init once the webpage has loaded
window.onload = init;