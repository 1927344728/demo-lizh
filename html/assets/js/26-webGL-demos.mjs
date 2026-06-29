import { vsSource, fsSource, createWebGLContext, compileShader, createProgram, createBuffer, bindAttrib } from './26-webGL.mjs';

export function executeDemo1 () {
  const { gl } = createWebGLContext(window.innerWidth, window.innerHeight);
  const vertices = new Float32Array([
     0.0,  0.5,  1.0, 0.0, 0.0,  // 顶点 A（上中点）红色
    -0.5, -0.5,  0.0, 1.0, 0.0,  // 顶点 B（左下）绿色
     0.5, -0.5,  0.0, 0.0, 1.0   // 顶点 C（右下）蓝色
  ]);
  createProgram(gl, vsSource, fsSource);
  createBuffer(gl, vertices, true);
  bindAttrib(gl, 'a_position', 2, 20, 0);
  bindAttrib(gl, 'a_color', 3, 20, 8);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

export function executeDemo2() {
  const { gl } = createWebGLContext(window.innerWidth, window.innerHeight);
  
  // 立方体顶点数据：每个面 6 个顶点（2 个三角形），6 个面共 36 个顶点
  // 顶点格式: [x, y, z, r, g, b]
  
  // 前面 (z = 0.5) - 红色
  const front = [
    -0.5, -0.5, 0.5,  1, 0, 0,
     0.5, -0.5, 0.5,  1, 0, 0,
     0.5,  0.5, 0.5,  1, 0, 0,
    -0.5, -0.5, 0.5,  1, 0, 0,
     0.5,  0.5, 0.5,  1, 0, 0,
    -0.5,  0.5, 0.5,  1, 0, 0
  ];
  
  // 后面 (z = -0.5) - 绿色
  const back = [
    -0.5, -0.5, -0.5,  0, 1, 0,
     0.5, -0.5, -0.5,  0, 1, 0,
     0.5,  0.5, -0.5,  0, 1, 0,
    -0.5, -0.5, -0.5,  0, 1, 0,
     0.5,  0.5, -0.5,  0, 1, 0,
    -0.5,  0.5, -0.5,  0, 1, 0
  ];
  
  // 左面 (x = -0.5) - 蓝色
  const left = [
    -0.5, -0.5, -0.5,  0, 0, 1,
    -0.5, -0.5,  0.5,  0, 0, 1,
    -0.5,  0.5,  0.5,  0, 0, 1,
    -0.5, -0.5, -0.5,  0, 0, 1,
    -0.5,  0.5,  0.5,  0, 0, 1,
    -0.5,  0.5, -0.5,  0, 0, 1
  ];
  
  // 右面 (x = 0.5) - 黄色
  const right = [
     0.5, -0.5, -0.5,  1, 1, 0,
     0.5, -0.5,  0.5,  1, 1, 0,
     0.5,  0.5,  0.5,  1, 1, 0,
     0.5, -0.5, -0.5,  1, 1, 0,
     0.5,  0.5,  0.5,  1, 1, 0,
     0.5,  0.5, -0.5,  1, 1, 0
  ];
  
  // 上面 (y = 0.5) - 品红
  const top = [
    -0.5,  0.5, -0.5,  1, 0, 1,
    -0.5,  0.5,  0.5,  1, 0, 1,
     0.5,  0.5,  0.5,  1, 0, 1,
    -0.5,  0.5, -0.5,  1, 0, 1,
     0.5,  0.5,  0.5,  1, 0, 1,
     0.5,  0.5, -0.5,  1, 0, 1
  ];
  
  // 下面 (y = -0.5) - 青色
  const bottom = [
    -0.5, -0.5, -0.5,  0, 1, 1,
    -0.5, -0.5,  0.5,  0, 1, 1,
     0.5, -0.5,  0.5,  0, 1, 1,
    -0.5, -0.5, -0.5,  0, 1, 1,
     0.5, -0.5,  0.5,  0, 1, 1,
     0.5, -0.5, -0.5,  0, 1, 1
  ];
  
  const vertices = new Float32Array([...front, ...back, ...left, ...right, ...top, ...bottom]);
  const cubeVS = `
    attribute vec3 a_position;
    attribute vec3 a_color;
    varying vec3 v_color;
    uniform float u_time;
    
    void main() {
      v_color = a_color;
      
      // 绕 Y 轴旋转
      float angle = u_time;
      float c = cos(angle);
      float s = sin(angle);
      
      vec3 pos = vec3(
        a_position.x * c + a_position.z * s,
        a_position.y,
        a_position.z * c - a_position.x * s
      );
      
      // 简单透视投影
      float zDepth = 2.0;
      float scale = zDepth / (zDepth + pos.z * 0.5);
      pos.x *= scale;
      pos.y *= scale;
      
      gl_Position = vec4(pos, 1.0);
    }
  `;
  const cubeFS = `
    precision mediump float;
    varying vec3 v_color;
    
    void main() {
      gl_FragColor = vec4(v_color, 1.0);
    }
  `;
  
  const program = createProgram(gl, cubeVS, cubeFS);
  createBuffer(gl, vertices);
  bindAttrib(gl, 'a_position', 3, 24, 0);
  bindAttrib(gl, 'a_color', 3, 24, 12);
  

  const u_time = gl.getUniformLocation(program, 'u_time');
  gl.clearColor(0.1, 0.1, 0.2, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  
  let startTime = performance.now();
  function animate(now) {
    const elapsed = (now - startTime) / 1000;
    
    gl.uniform1f(u_time, elapsed);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
    
    requestAnimationFrame(animate);
  }
  
  animate(startTime);
}

export function executeDemo3 () {
  function drawPoints(gl) {
    const points = [];
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 1.8;
      const y = (Math.random() - 0.5) * 1.8;
      const r = Math.random();
      const g = Math.random();
      const b = Math.random();
      points.push(x, y, r, g, b);
    }
    const vertices = new Float32Array(points);
    createBuffer(gl, vertices);
    createProgram(gl, vsSource, fsSource);
    bindAttrib(gl, 'a_position', 2, 20, 0);
    bindAttrib(gl, 'a_color', 3, 20, 8);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, 30);
  }

  function drawLines(gl) {
    const vertices = new Float32Array([
      // 线段1: 从左到右
      -0.8, 0.5,  1.0, 0.0, 0.0,
      0.0, 0.5,  1.0, 0.0, 0.0,
      // 线段2: 斜线
      -0.5, 0.0,  0.0, 1.0, 0.0,
      0.3, -0.4, 0.0, 1.0, 0.0,
      // 线段3: 竖线
      0.5, -0.8, 0.0, 0.0, 1.0,
      0.5,  0.2, 0.0, 0.0, 1.0
    ]);
    createBuffer(gl, vertices);
    createProgram(gl, vsSource, fsSource);
    bindAttrib(gl, 'a_position', 2, 20, 0);
    bindAttrib(gl, 'a_color', 3, 20, 8);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINES, 0, 6);
  }

  function drawLineStrip(gl) {
    const vertices = new Float32Array([
      -0.8, -0.6, 1.0, 0.2, 0.2,
      -0.4,  0.5, 1.0, 0.5, 0.0,
      0.0, -0.3, 0.0, 1.0, 0.0,
      0.5,  0.4, 0.0, 0.5, 1.0,
      0.8, -0.5, 0.8, 0.0, 0.8
    ]);
    createBuffer(gl, vertices);
    createProgram(gl, vsSource, fsSource);
    bindAttrib(gl, 'a_position', 2, 20, 0);
    bindAttrib(gl, 'a_color', 3, 20, 8);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINE_STRIP, 0, 5);
  }

  function drawLineLoop(gl) {
    const vertices = new Float32Array([
     0.0,  0.8, 1.0, 0.0, 0.0,
     0.7,  0.3, 1.0, 0.5, 0.0,
     0.4, -0.5, 0.0, 1.0, 0.0,
     -0.4, -0.5, 0.0, 0.5, 1.0,
     -0.7,  0.3, 0.8, 0.0, 0.8
   ]);
    createBuffer(gl, vertices);
    createProgram(gl, vsSource, fsSource);
    bindAttrib(gl, 'a_position', 2, 20, 0);
    bindAttrib(gl, 'a_color', 3, 20, 8);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINE_LOOP, 0, 5);
  }

  function drawTriangles(gl) {
    const vertices = new Float32Array([
      // 三角形1（红色）
      -0.6,  0.3, 1.0, 0.0, 0.0,
      -0.8, -0.2, 1.0, 0.0, 0.0,
      -0.2, -0.2, 1.0, 0.0, 0.0,
      // 三角形2（蓝色）
      0.2,  0.4, 0.0, 0.0, 1.0,
      0.6, -0.1, 0.0, 0.0, 1.0,
      0.8,  0.3, 0.0, 0.0, 1.0
    ]);
    createBuffer(gl, vertices);
    createProgram(gl, vsSource, fsSource);
    bindAttrib(gl, 'a_position', 2, 20, 0);
    bindAttrib(gl, 'a_color', 3, 20, 8);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function drawTriangleStrip(gl) {
    const vertices = new Float32Array([
      -0.7,  0.5, 1.0, 0.0, 0.0,  // v0 红色
       0.7,  0.5, 0.0, 1.0, 0.0,  // v1 绿色
      -0.7, -0.5, 0.0, 0.0, 1.0,  // v2 蓝色
       0.7, -0.5, 1.0, 1.0, 0.0   // v3 黄色
     ]);
    createBuffer(gl, vertices);
    createProgram(gl, vsSource, fsSource);
    bindAttrib(gl, 'a_position', 2, 20, 0);
    bindAttrib(gl, 'a_color', 3, 20, 8);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function drawTriangleFan(gl) {
    const centerX = 0, centerY = 0;
    const radius = 0.8;
    const segments = 8;
    const vertices = [];

    vertices.push(centerX, centerY, 1.0, 1.0, 1.0);

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const hue = i / segments;
      // HSV 转 RGB 简化版
      const r = Math.sin(hue * Math.PI * 2);
      const g = Math.sin((hue + 0.33) * Math.PI * 2);
      const b = Math.sin((hue + 0.67) * Math.PI * 2);
      vertices.push(x, y, (r + 1) / 2, (g + 1) / 2, (b + 1) / 2);
    }

    const vertexArray = new Float32Array(vertices);
    createBuffer(gl, vertexArray);
    createProgram(gl, vsSource, fsSource);
    bindAttrib(gl, 'a_position', 2, 20, 0);
    bindAttrib(gl, 'a_color', 3, 20, 8);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, segments + 2);
  }

  const funcs = [drawPoints, drawLines, drawLineStrip, drawLineLoop, drawTriangles, drawTriangleStrip, drawTriangleFan];
  funcs.forEach(f => {
    const { gl } = createWebGLContext(window.innerWidth, window.innerWidth);
    f(gl);
  });
}

export function executeDemo4 () {
  const { gl } = createWebGLContext(window.innerWidth, window.innerHeight);
  const vertices = new Float32Array([
     0.0,  0.5,  1.0, 0.0, 0.0,  // 上中点，红色
    -0.5, -0.5,  0.0, 1.0, 0.0,  // 左下，绿色
     0.5, -0.5,  0.0, 0.0, 1.0   // 右下，蓝色
   ]);

  const modelVS = `
    attribute vec2 a_position;
    attribute vec3 a_color;
    varying vec3 v_color;
    uniform mat3 u_modelMatrix;

    void main() {
      v_color = a_color;
      vec3 pos = u_modelMatrix * vec3(a_position, 1.0);
      gl_Position = vec4(pos.xy, 0.0, 1.0);
    }
  `;

  const program = createProgram(gl, modelVS, fsSource);
  createBuffer(gl, vertices);
  bindAttrib(gl, 'a_position', 2, 20, 0);
  bindAttrib(gl, 'a_color', 3, 20, 8);

  // 构建模型矩阵 (平移 × 旋转 × 缩放)
  // 顺序：先缩放，再旋转，最后平移
  function buildModelMatrix(tx, ty, sx, sy, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Float32Array([
      sx * c,  sx * s, 0,
      -sy * s, sy * c, 0,
      tx,      ty,     1
    ]);
  }

  function applyMatrix(matrix) {
    const u_modelMatrix = gl.getUniformLocation(program, 'u_modelMatrix');
    gl.uniformMatrix3fv(u_modelMatrix, false, matrix);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function setModel (tx, ty, sx, sy, angle) {
    const currentMatrix = buildModelMatrix(tx, ty, sx, sy, angle);
    applyMatrix(currentMatrix);
  };

  gl.clearColor(0.1, 0.1, 0.2, 1.0);
  gl.enable(gl.DEPTH_TEST);

  setModel(0, 0, 1, 1, 0);
  window.setModel = setModel

  console.log('模型矩阵示例：')
  console.log('setModel (tx, ty, sx, sy, angle)')
  console.log('setModel(0.2, 0.2, 1, 1, 0) —— 平移')
  console.log('setModel(0, 0, 0.8, 0.8, 0) —— 缩放')
  console.log('setModel(0, 0, 1, 1, 0.4) —— 旋转')
}

export function executeDemo5 () {
  const { gl } = createWebGLContext(window.innerWidth, window.innerHeight);
  const vertices = new Float32Array([
     0.0,  0.5,  0.0,    1.0, 0.0, 0.0,  // 顶点A 红色
    -0.5, -0.5,  0.0,    0.0, 1.0, 0.0,  // 顶点B 绿色
     0.5, -0.5,  0.0,    0.0, 0.0, 1.0   // 顶点C 蓝色
  ]);

  const viewVS = `
    attribute vec3 a_position;
    attribute vec3 a_color;
    varying vec3 v_color;
    uniform mat4 u_viewMatrix;

    void main() {
      v_color = a_color;
      vec4 pos = u_viewMatrix * vec4(a_position, 1.0);
      gl_Position = pos;
    }
  `;

  const program = createProgram(gl, viewVS, fsSource);
  createBuffer(gl, vertices);
  bindAttrib(gl, 'a_position', 3, 24, 0);
  bindAttrib(gl, 'a_color', 3, 24, 12);

  const u_viewMatrix = gl.getUniformLocation(program, 'u_viewMatrix');

  // 构建视图矩阵 (简化版：先测试平移，暂时不做复杂旋转) 
  function buildViewMatrix(eyeX, eyeY, eyeZ) {
    return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      -eyeX, -eyeY, -eyeZ, 1
    ]);
  }

  // 单位矩阵：没有任何变换，相当于相机在原点看向 -Z 的默认状态
  function getIdentityMatrix() {
    return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }

  function applyMatrix(matrix) {
    gl.uniformMatrix4fv(u_viewMatrix, false, matrix);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  applyMatrix(getIdentityMatrix());

  let currentEye = { x: 0, y: 0, z: 0 };
  function getView() {
    console.log(`当前相机位置: (${currentEye.x}, ${currentEye.y}, ${currentEye.z})`);
  }

  function setView(eyeX, eyeY, eyeZ) {
    currentEye = { x: eyeX, y: eyeY, z: eyeZ };
    const matrix = buildViewMatrix(eyeX, eyeY, eyeZ);
    applyMatrix(matrix);
    getView()
  }

  function resetView() {
    setView(0, 0, 0);
    getView()
  }

  gl.clearColor(0.1, 0.1, 0.2, 1.0);
  gl.disable(gl.DEPTH_TEST);

  window.setView = setView;
  window.resetView = resetView;
  window.getView = getView;

  console.log('初始化完成，可用命令：');
  console.log('setView(0, 0, 0.5)  - 相机放在 (0,0,0.5)');
  console.log('setView(0.2, 0.2, 0)    - 相机放在 (0.2,0.2,0)');
}

export function executeDemo6 () {
  const { gl } = createWebGLContext(window.innerWidth, window.innerHeight);
  const vertices = new Float32Array([
     0.0,  0.5, -0.5,    1.0, 0.0, 0.0,  // A: 红色, Z = -0.5 (靠前)
    -0.5, -0.5,  0.0,    0.0, 1.0, 0.0,  // B: 绿色, Z = 0.0
     0.5, -0.5,  0.5,    0.0, 0.0, 1.0   // C: 蓝色, Z = 0.5 (靠后)
  ]);

  const projectionVS = `
    attribute vec3 a_position;
    attribute vec3 a_color;
    varying vec3 v_color;
    uniform mat4 u_projectionMatrix;

    void main() {
        v_color = a_color;
        vec4 pos = u_projectionMatrix * vec4(a_position, 1.0);
        gl_Position = pos;
    }
  `;

  const program = createProgram(gl, projectionVS, fsSource);
  createBuffer(gl, vertices);
  bindAttrib(gl, 'a_position', 3, 24, 0);
  bindAttrib(gl, 'a_color', 3, 24, 12);

  const u_projectionMatrix = gl.getUniformLocation(program, 'u_projectionMatrix');
  // 透视投影
  function buildPerspectiveMatrix(fov, aspect, near, far) {
    const f = 1.0 / Math.tan(fov * Math.PI / 360);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) / (near - far), -1,
      0, 0, (2 * far * near) / (near - far), 0
    ]);
  }

  // 正交投影
  function buildOrthoMatrix(left, right, bottom, top, near, far) {
    return new Float32Array([
      2 / (right - left), 0, 0, 0,
      0, 2 / (top - bottom), 0, 0,
      0, 0, -2 / (far - near), 0,
      -(right + left) / (right - left),
      -(top + bottom) / (top - bottom),
      -(far + near) / (far - near),
      1
    ]);
  }

  // 无投影（单位矩阵）
  function buildNoneMatrix() {
    return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }

  function applyMatrix(matrix, name) {
    gl.uniformMatrix4fv(u_projectionMatrix, false, matrix);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    console.log(`[${name}] 已应用`);
  }


  function setPerspective(fov, aspect, near, far) {
    fov = fov !== undefined ? fov : 45;
    aspect = aspect !== undefined ? aspect : (window.innerWidth / window.innerHeight);
    near = near !== undefined ? near : 0.1;
    far = far !== undefined ? far : 10;

    const matrix = buildPerspectiveMatrix(fov, aspect, near, far);
    applyMatrix(matrix, `透视投影 fov=${fov}°, near=${near}, far=${far}`);
  }

  // 正交投影：定义一个长方体可视区域
  // left/right：控制 X 方向的宽度和位置
  // bottom/top：控制 Y 方向的高度和位置
  // near/far：控制 Z 方向的深度和位置
  function setOrtho(left, right, bottom, top, near, far) {
    left = left !== undefined ? left : -1;
    right = right !== undefined ? right : 1;
    bottom = bottom !== undefined ? bottom : -1;
    top = top !== undefined ? top : 1;
    near = near !== undefined ? near : 0.1;
    far = far !== undefined ? far : 10;

    const matrix = buildOrthoMatrix(left, right, bottom, top, near, far);
    applyMatrix(matrix, `正交投影 left=${left}, right=${right}, bottom=${bottom}, top=${top}`);
  }

  function setNone() {
    const matrix = buildNoneMatrix();
    applyMatrix(matrix, '无投影（单位矩阵）');
  }

  gl.clearColor(0.1, 0.1, 0.2, 1.0);
  gl.enable(gl.DEPTH_TEST);

  setNone();

  window.setPerspective = setPerspective;
  window.setOrtho = setOrtho;
  window.setNone = setNone;

  console.log('初始化完成，可用命令：');
  console.log('无投影（默认）：setNone()');
  console.log('')
  console.log('正交投影：setOrtho(left, right, bottom, top, near, far)');
  console.log('left/right/bottom/top/near/far，定义正交投景（长方体）的区域');
  console.log('全部可见：setOrtho(-1, 1, -1, 1, -1, 1)');
  console.log('物体看起来更大：setOrtho(-0.5, 0.5, -0.5, 0.5, -1, 1)')
  console.log('物体看起来更小：setOrtho(-2, 2, -2, 2, -1, 1)')
  console.log('物体在屏幕中偏移：setOrtho(0, 2, -1, 1, -1, 1)')
  console.log('')
  console.log('透视投影：setPerspective(fov, aspect, near, far)');
  console.log('fov/aspect/near/far，定义视野角、宽高比、z轴位置');
  console.log('标准透视：fsetPerspective(45, 1.5, 0.1, 10)');
  console.log('长焦效果（物体放大）：setPerspective(20, 1.5, 0.1, 10)');
  console.log('广角效果（物体缩小）：setPerspective(80, 1.5, 0.1, 10)');
}

export function executeDemo7 () {
  const { gl } = createWebGLContext(window.innerWidth, window.innerHeight);
  const vertices = new Float32Array([
    0.0,  0.6,  1.0, 0.0, 0.0,  // 顶点0: 上，红色
    -0.6, -0.4,  0.0, 1.0, 0.0,  // 顶点1: 左下，绿色
    0.6, -0.4,  0.0, 0.0, 1.0   // 顶点2: 右下，蓝色
  ]);

  // 带旋转的顶点着色器
  const rotateVS = `
    attribute vec2 a_position;
    attribute vec3 a_color;
    varying vec3 v_color;
    uniform float u_angle;

    void main() {
      v_color = a_color;

      float c = cos(u_angle);
      float s = sin(u_angle);
      float x = a_position.x;
      float y = a_position.y;

      float x2 = x * c - y * s;
      float y2 = x * s + y * c;

      gl_Position = vec4(x2, y2, 0.0, 1.0);
    }
  `;

  const program = createProgram(gl, rotateVS, fsSource);
  createBuffer(gl, vertices);
  bindAttrib(gl, 'a_position', 2, 20, 0);
  bindAttrib(gl, 'a_color', 3, 20, 8);

  const u_angle = gl.getUniformLocation(program, 'u_angle');
  let angle = 0;
  gl.uniform1f(u_angle, angle);

  let lastX = 0;
  let isDragging = false;
  gl.canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const dx = e.clientX - lastX;
      angle += dx * 0.01;
      lastX = e.clientX;

      gl.uniform1f(u_angle, angle);
    };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  gl.clearColor(0.1, 0.1, 0.2, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);

  function animate() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(animate);
  }

  animate();
}

export function executeDemo8 () {
  const { gl } = createWebGLContext(window.innerWidth, window.innerHeight);
  const vertices = new Float32Array([
    // 位置(x,y)    纹理坐标(s,t)
    // 注意：Canvas 和 WebGL 的纹理坐标 Y 轴方向是相反的
     0.0,  0.5,     0.5, 0.0,  // 顶点A：t 从 1.0 改为 0.0
    -0.5, -0.5,     0.0, 1.0,  // 顶点B：t 从 0.0 改为 1.0
     0.5, -0.5,     1.0, 1.0   // 顶点C：t 从 0.0 改为 1.0
  ]);

  function createTexture(gl) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const size = 32;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#ff6b6b' : '#4ecdc4';
        ctx.fillRect(x * size, y * size, size, size);
      }
    }
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('WebGL 纹理', 128, 200);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return texture;
  }

  const texture = createTexture(gl);
  const vsTexture = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;

    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
    }
  `;

  const fsTexture = `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_texture;

    void main() {
        gl_FragColor = texture2D(u_texture, v_texCoord);
    }
  `;

  const program = createProgram(gl, vsTexture, fsTexture);
  createBuffer(gl, vertices);
  bindAttrib(gl, 'a_position', 2, 16, 0);
  bindAttrib(gl, 'a_texCoord', 2, 16, 8);

  const u_texture = gl.getUniformLocation(program, 'u_texture');
  gl.uniform1i(u_texture, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.clearColor(0.1, 0.1, 0.2, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

export function executeDemo9 () {
  const { gl } = createWebGLContext(window.innerWidth, window.innerHeight);

  // 顶点数据：位置 (x,y) + 法线 (nx,ny)
  const vertices = new Float32Array([
    // 顶点 A (上)     法线方向 (指向左上)
    0.0,  0.5,      -0.5,  0.5,
    // 顶点 B (左下)   法线方向 (指向左下)
    -0.5, -0.5,      -0.5, -0.5,
    // 顶点 C (右下)   法线方向 (指向右下)
    0.5, -0.5,       0.5, -0.5
  ]);

  // 着色器
  const vsLight = `
    attribute vec2 a_position;
    attribute vec2 a_normal;
    varying vec3 v_normal;
    varying vec3 v_color;

    void main() {
      v_normal = normalize(vec3(a_normal, 0.0));
      gl_Position = vec4(a_position, 0.0, 1.0);

      // 顶点颜色：红、绿、蓝
      vec3 colorA = vec3(1.0, 0.2, 0.2);
      vec3 colorB = vec3(0.2, 1.0, 0.2);
      vec3 colorC = vec3(0.2, 0.2, 1.0);

      if (a_position.y > 0.0) {
        v_color = colorA;
      } else if (a_position.x < 0.0) {
        v_color = colorB;
      } else {
        v_color = colorC;
      }
    }
  `;

  const fsLight = `
    precision mediump float;
    varying vec3 v_normal;
    varying vec3 v_color;
    uniform vec3 u_lightDir;
    uniform vec3 u_ambientColor;
    uniform float u_enableLight;

    void main() {
      vec3 baseColor = v_color;
      vec3 normal = normalize(v_normal);
      vec3 lightDir = normalize(u_lightDir);

      // 环境光
      vec3 ambient = u_ambientColor * baseColor * 0.3;

      // 漫反射
      float diff = max(dot(normal, lightDir), 0.0);
      vec3 diffuse = diff * baseColor * 0.8;

      // 开关：1=有灯光，0=无灯光
      vec3 withLight = ambient + diffuse;
      vec3 withoutLight = baseColor * 0.5;

      vec3 finalColor = mix(withoutLight, withLight, u_enableLight);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  const program = createProgram(gl, vsLight, fsLight);
  createBuffer(gl, vertices);
  bindAttrib(gl, 'a_position', 2, 16, 0);
  bindAttrib(gl, 'a_normal', 2, 16, 8);

  const u_lightDir = gl.getUniformLocation(program, 'u_lightDir');
  const u_ambientColor = gl.getUniformLocation(program, 'u_ambientColor');
  const u_enableLight = gl.getUniformLocation(program, 'u_enableLight');

  let enableLight = 1;
  // 灯光方向（向量指向光源）
  const lightDir = [0.5, 0.8, 0.0];
  const ambientColor = [0.3, 0.3, 0.3];
  gl.uniform3fv(u_lightDir, lightDir);
  gl.uniform3fv(u_ambientColor, ambientColor);
  gl.uniform1f(u_enableLight, enableLight);

  function draw() {
    gl.clearColor(0.1, 0.1, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function setLightDir (x, y, z) {
    const dir = [
      x !== undefined ? x : lightDir[0],
      y !== undefined ? y : lightDir[1],
      z !== undefined ? z : lightDir[2]
    ];
    gl.uniform3fv(u_lightDir, dir);
    draw();
    console.log('灯光方向:', dir);
  }

  function toggleLight () {
    enableLight = enableLight === 1 ? 0 : 1;
    gl.uniform1f(u_enableLight, enableLight);
    draw();
    console.log('灯光:', enableLight ? '开' : '关');
  }

  function setAmbient (r, g, b) {
    gl.uniform3fv(u_ambientColor, [r, g, b]);
    draw();
    console.log('环境光:', [r, g, b]);
  }

  draw();
  window.setLightDir = setLightDir
  window.toggleLight = toggleLight
  window.setAmbient = setAmbient

  console.log('可用命令:');
  console.log('toggleLight() - 开关灯光');
  console.log('setLightDir(x, y, z) - 改变灯光方向');
  console.log('setAmbient(r, g, b) - 改变环境光颜色');
  console.log('灯光方向示例:');
  console.log('setLightDir(1, 0, 0)   - 从右照射');
  console.log('setLightDir(0, 1, 0)   - 从上照射');
  console.log('setLightDir(1, 1, 0)   - 从右上照射');
  console.log('setLightDir(-1, 0, 0)  - 从左照射');
  console.log('setLightDir(0, -1, 0)  - 从下照射');
  console.log('setLightDir(1, 0.5, 0) - 右偏上照射');
  console.log('调整环境光颜色示例:');
  console.log('setAmbient(0.5, 0.3, 0.3) - 暖色环境光');
  console.log('setAmbient(0.3, 0.3, 0.5) - 冷色环境光');
}