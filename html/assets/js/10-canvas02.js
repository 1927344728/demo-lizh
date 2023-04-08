function getContext2D() {
  return new Promise((resolve, reject) => {
    let canvas = document.getElementById("canvas")
    let context = canvas.getContext("2d")
    if (context) {
      resolve(context)
    } else {
      reject()
    }
  })
}

function getNumberFromRang (min = 0, max = 1) {
  return min + Math.ceil(Math.random() * (max - min))
}

function generateCircleList (num) {
  const list = []
  for (let n = 0; n < num; n ++) {
    list.push({
      x: getNumberFromRang(30, 500 - 30),
      y: getNumberFromRang(30, 300 - 30),
      radius: getNumberFromRang(10, 30),
      startAngle: 0,
      endAngle: Math.PI * 2,
      anticlockwise: Math.random() < 0.5,
      fillColor: `#${Math.random().toString(16).slice(2,8)}`,
      strokeColor: `#${Math.random().toString(16).slice(2,8)}`
    })
  }
  return list
}

function drawCircle (ctx, list) {
  list.forEach(e => {
    ctx.beginPath();
    ctx.fillStyle = e.fillColor;
    ctx.strokeStyle = e.strokeColor;
    ctx.arc(e.x, e.y, e.radius, e.startAngle, e.endAngle, e.anticlockwise);
    ctx.fill();
    ctx.stroke();
  })
}