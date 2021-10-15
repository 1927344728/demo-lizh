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

function drawLine(context) {
  context.moveTo(100, 100)
  context.lineTo(300, 200)
  context.lineWidth = 2
  context.strokeStyle = "#0dd"
  context.stroke()
}

//绘制折线：粉红 -> 深蓝
function drawBrokenLine(context) {
  context.lineWidth = 2

  context.moveTo(100, 100)
  context.lineTo(300, 300)
  context.strokeStyle = "#d0d"
  context.stroke()

  context.moveTo(300, 300)
  context.lineTo(100, 500)
  context.strokeStyle = "#00d"
  context.stroke()
}
function drawMultBrokenLine(context) {
  context.lineWidth = 2

  context.beginPath()
  context.moveTo(100, 100)
  context.lineTo(300, 200)
  context.strokeStyle = "#0dd"
  context.stroke()

  context.beginPath()
  context.moveTo(100, 100)
  context.lineTo(300, 300)
  context.strokeStyle = "#d0d"
  context.stroke()

  context.beginPath()
  context.moveTo(300, 300)
  context.lineTo(100, 500)
  context.strokeStyle = "#00d"
  context.stroke()
}
function createLinearGradient(context) {
  context.rect(100, 100, 300, 300);
  let grd = context.createLinearGradient(100, 100, 300, 300)
  grd.addColorStop(0, "#dd0")
  grd.addColorStop(0.5, "#fd0")
  grd.addColorStop(1, "#0dd")
  context.fillStyle = grd
  context.fill()
}
function createRadialGradient(context) {
  let grd = context.createRadialGradient(75, 50, 5, 90, 60, 100)
  grd.addColorStop(0, "#0aa")
  grd.addColorStop(1, "white")
  context.fillStyle = grd
  context.fillRect(10, 10, 300, 300)
}
function createPattern(context) {
  let canvas = document.createElement("canvas")
  let context2 = canvas.getContext('2d')
  canvas.width = 200
  canvas.height = 200
  let img = new Image()
  img.src = "assets/img/pins_3338674420.jpg"
  img.onload = function () {
    context2.drawImage(img, 0, 0, 200, 200)
    let pattern = context.createPattern(canvas, 'no-repeat')
    context.fillStyle = pattern
    context.fillRect(0, 0, 500, 500)
    context.lineWidth = 1
    context.strokeStyle = '#0dd'
    context.strokeRect(0, 0, 500, 500)
  }
}
function drawArc(context) {
  context.beginPath()
  context.lineWidth = 1
  context.strokeStyle = '#0dd'
  context.arc(100, 75, 100, 0, (120 / 180) * Math.PI, false)
  context.stroke()
}
function drawArcTo(context) {
  context.beginPath()
  context.lineWidth = 1
  context.strokeStyle = '#0dd'
  context.moveTo(20, 20)
  context.lineTo(100, 20)
  context.arcTo(150, 20, 150, 70, 50)
  context.lineTo(150, 100)
  context.stroke()
}
function drawQuadraticCurveTo(context) {
  context.lineWidth = 1
  context.strokeStyle = '#0dd'
  context.beginPath()
  context.moveTo(20, 20)
  context.quadraticCurveTo(20, 100, 200, 20)
  context.stroke()
}
function drawText(context) {
  context.fillStyle = "#0aa"
  context.strokeStyle = "#0aa"

  context.font = "normal normal bold 30px/150px Times"
  context.textAlign = "center"
  context.textBaseline = "middle"

  context.fillText("Hello Canvas", 200, 250)
  context.strokeText("width:" + context.measureText("Hello Canvas").width, 200, 300, 200)
}
function transform(context) {
  context.save()
  context.fillStyle = "#0aa"
  context.scale(1, 0.5)
  context.rotate(10 * Math.PI / 180)
  context.translate(20, 0)
  context.fillRect(0, 0, 100, 100)
  console.log('scale')
  context.restore()


  //transform
  context.save()
  context.translate(200, 0)
  context.fillStyle = "yellow"
  context.fillRect(0, 0, 100, 80)

  context.transform(1, 0.5, -0.5, 1, 30, 10)
  context.fillStyle = "red"
  context.fillRect(0, 0, 100, 80)

  context.transform(1, 0.5, -0.5, 1, 30, 10)
  context.fillStyle = "blue"
  context.fillRect(0, 0, 100, 80)
  context.restore()


  //setTransform
  context.save()
  context.translate(400, 0)
  context.fillStyle = "yellow"
  context.fillRect(0, 0, 100, 80)

  context.setTransform(1, 0.5, -0.5, 1, 400, 0)
  context.fillStyle = "red"
  context.fillRect(0, 0, 100, 80)

  context.setTransform(1, 0.5, -0.5, 1, 400, 0)
  context.fillStyle = "blue"
  context.fillRect(0, 0, 100, 80)
  context.restore()
}
function setClip(context) {
  context.save()
  context.beginPath()
  context.fillStyle = '#0aa'
  context.arc(100, 100, 100, 2 * Math.PI, false)
  context.clip()
  let img = new Image()
  img.src = "assets/img/pins_3338674420.jpg"
  img.onload = function () {
    context.drawImage(img, 0, 0, 350, 250)
    context.closePath()
    context.restore()

    context.beginPath()
    context.moveTo(100, 100)
    context.lineTo(300, 100)
    context.strokeStyle = '#0aa'
    context.stroke()
    context.closePath()
  }
}
function drawImage(context) {
  let img = new Image()
  img.src = "assets/img/pins_3338674420.jpg"
  img.onload = function () {
    // context.drawImage(img, 0, 0, 500, 500, 0, 0, window.innerWidth, window.innerHeight)
    context.drawImage(img, 0, 0, 350, 250)
  }
}
function drawCircular(context) {
  context.shadowColor = "#545454";
  context.shadowOffsetX = 5;
  context.shadowOffsetY = 5;
  context.shadowBlur = 2;
  context.globalCompositeOperation = 'source-over'

  context.fillStyle = "#00AAAA"
  context.arc(200, 200, 100, 0, Math.PI * 2, false)
  context.arc(200, 200, 115, 0, Math.PI * 2, true)
  context.fill()
}
function roundRect(context, x, y, w, h, r) {
  var min_size = Math.min(w, h);
  if (r > min_size / 2) {
    r = min_size / 2
  }
  context.beginPath()
  context.lineWidth = 1
  context.strokeStyle = '#0dd'
  context.moveTo(x + r, y)
  context.arcTo(x + w, y, x + w, y + h, r)
  context.arcTo(x + w, y + h, x, y + h, r)
  context.arcTo(x, y + h, x, y, r)
  context.arcTo(x, y, x + w, y, r)
  context.stroke()
}
function drawRoundImg(ctx, x, y, w, h, r) {
  ctx.save();
  let img = new Image()
  img.src = "assets/img/pins_3338674420.jpg"
  img.onload = function () {
    roundRect(ctx, x, y, w, h, r)
    ctx.clip();
    ctx.drawImage(img, x, y, w, h)
    ctx.restore()
  }
}
function drawRoundImg2(ctx, x, y, w, h, r) {
  ctx.save();
  let img = new Image()
  img.src = "assets/img/pins_3338674420.jpg"
  img.onload = function () {
    let pattern = ctx.createPattern(img, "no-repeat");
    roundRect(ctx, x, y, w, h, r)
    ctx.fillStyle = pattern
    ctx.fill()
  }
}
