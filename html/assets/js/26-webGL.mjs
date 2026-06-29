export const vsSource = `
  attribute vec2 a_position;
  attribute vec3 a_color;
  varying vec3 v_color;
  void main() {
    gl_PointSize = 8.0;
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_color = a_color;
  }
`;

export const fsSource = `
  precision mediump float;
  varying vec3 v_color;
  void main() {
    gl_FragColor = vec4(v_color, 1.0);
  }
`;

// 创建 WebGL 上下文
export function createWebGLContext(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width || window.innerWidth;
  canvas.height = height || window.innerHeight;
  document.body.appendChild(canvas);
  
  const gl = canvas.getContext('webgl');
  if (!gl) {
    alert('WebGL 不支持');
    return null;
  }
  gl.viewport(0, 0, canvas.width, canvas.height);
  return { gl, canvas };
}

// 编译着色器
export function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader 编译错误:', gl.getShaderInfoLog(shader));
  }
  return shader;
}

// 创建程序
export function createProgram(gl, vsSource, fsSource) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program 链接错误:', gl.getProgramInfoLog(program));
  }
  gl.useProgram(program);
  return program;
}

// 创建缓冲区并上传数据
export function createBuffer(gl, vertices) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  return buffer;
}

// 绑定单个属性
export function bindAttrib(gl, name, size, stride, offset) {
  const program = gl.getParameter(gl.CURRENT_PROGRAM);
  const location = gl.getAttribLocation(program, name);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset);
  return location;
}