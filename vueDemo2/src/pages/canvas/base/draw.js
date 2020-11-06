export default {
    drawStart (context) {
        //绘制线条
        // this.drawLine(context)
        // this.drawBrokenLine(context)
        // this.drawMultBrokenLine(context)
        // this.createLinearGradient(context)
        this.createRadialGradient(context)
    },
    getContext () {
        return new Promise((resolve, reject) => {
            let canvas = document.getElementById("canvas_base")
            let context = canvas.getContext("2d")
            if (context) {
                resolve(context)
            } else {
                reject()
            }
        })
    },
    drawLine (context) {
        context.moveTo(100, 100)
        context.lineTo(300, 200)
        context.lineWidth = 2
        context.strokeStyle = "#0dd"
        context.stroke()
    },
    drawBrokenLine (context) {
        context.lineWidth = 2

        context.moveTo(100, 100)
        context.lineTo(300, 300)
        context.strokeStyle = "#d0d"
        context.stroke()

        context.moveTo(300, 300)
        context.lineTo(100, 500)
        context.strokeStyle = "#00d"
        context.stroke()
    },
    drawMultBrokenLine (context) {
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
    },
    createLinearGradient (context) {
        context.rect(100, 100, 300, 300);
        let grd = context.createLinearGradient(100, 100, 300, 300)
        grd.addColorStop(0, "#dd0")
        grd.addColorStop(0.5, "#fd0")
        grd.addColorStop(1, "#0dd")
        context.fillStyle = grd
        context.fill()
    },
    createRadialGradient (context) {
        let grd = context.createRadialGradient(75, 50, 5, 90, 60, 100)
        grd.addColorStop(0, "red")
        grd.addColorStop(1, "white")
        context.fillStyle = grd
        context.fillRect(10, 10, 300, 300)
    },
    createPattern (context) {
        let canvas = document.createElement("canvas")
        let context2 = canvas.getContext('2d')
        canvas.width = 200
        canvas.height = 200
        let img = new Image()
        img.src = require("@/assets/image/01eb485e44bf8fa8012165187fa336.jpg@1280w_1l_2o_100sh.jpg")
        img.onload = function() {
            context2.drawImage(img, 0, 0, 200, 200)
            let pattern = context.createPattern(canvas, 'no-repeat')
            context.fillStyle = pattern
            context.fillRect(0, 0, 200, 200)
            context.lineWidth = 1
            context.strokeStyle = '#0dd'
            context.strokeRect(0, 0, 200, 200)
        }
    },
    drawArc (context) {
        context.beginPath()
        context.lineWidth = 1
        context.strokeStyle = '#0dd'
        context.arc(100, 75, 50, 0,  (120 / 180) * Math.PI, false)
        context.stroke()
    },
    drawArcTo (context) {
        context.beginPath()
        context.lineWidth = 1
        context.strokeStyle = '#0dd'
        context.moveTo(20, 20)
        context.lineTo(100, 20)
        context.arcTo(150, 20, 150, 70,50)
        context.lineTo(150, 100)
        context.stroke()
    },
    drawQuadraticCurveTo (context) {
        context.lineWidth = 1
        context.strokeStyle = '#0dd'
        context.beginPath()
        context.moveTo(20, 20)
        context.quadraticCurveTo(20, 100, 200, 20)
        context.stroke()
    },
    drawBezierCurveTo (context) {
        context.lineWidth = 1
        context.strokeStyle = '#0dd'
        context.beginPath()
        context.moveTo(20, 20)
        context.bezierCurveTo(20, 100, 200, 100, 200, 20)
        context.stroke()
    },
    drawText (context) {
        context.fillStyle = "#0aa"
        context.strokeStyle = "#0aa"

        context.font = "normal normal bold 30px/150px Times"
        context.textAlign = "center"
        context.textBaseline = "middle"

        context.fillText("Hello Canvas", 200, 250)
        context.strokeText("width:" + context.measureText("Hello Canvas").width, 200, 300, 200)
    },
    transform (context) {
        context.save()
        context.fillStyle = "#0aa"
        context.scale(1, 0.5)
        context.rotate(10 * Math.PI / 180)
        context.translate(20, 0)
        context.fillRect(0, 0, 150, 150)
        console.log('scale')
        context.restore()


        //transform
        context.save()
        context.translate(20, 150)
        context.fillStyle = "yellow"
        context.fillRect(0, 0, 150, 100)

        context.transform(1, 0.5, -0.5, 1, 30, 10)
        context.fillStyle = "red"
        context.fillRect(0, 0, 150, 100)

        context.transform(1, 0.5, -0.5, 1, 30, 10)
        context.fillStyle = "blue"
        context.fillRect(0, 0, 150, 100)
        context.restore()


        //setTransform
        context.save()
        context.translate(100, 400)
        context.fillStyle = "yellow"
        context.fillRect(0, 0, 150, 100)

        context.setTransform(1, 0.5, -0.5, 1, 100, 400)
        context.fillStyle = "red"
        context.fillRect(0, 0, 150, 100)

        context.setTransform(1, 0.5, -0.5, 1, 100, 400)
        context.fillStyle = "blue"
        context.fillRect(0, 0, 150, 100)
        context.restore()
    },
    setShadow (context) {
        context.shadowBlur = 5
        context.shadowColor = "#d0d"
        context.shadowOffsetX = 20
        context.shadowOffsetY = 20
        context.strokeStyle = "#0aa"
        context.strokeRect(20, 20, 100, 80)
    },
    drawImage (context) {
        let img = new Image()
        img.src = require("@/assets/image/01eb485e44bf8fa8012165187fa336.jpg@1280w_1l_2o_100sh.jpg")
        img.onload = function() {
            // context.drawImage(img, 0, 0, 500, 500, 0, 0, window.innerWidth, window.innerHeight)
            context.drawImage(img, 0, 0, 350, 250)
        }
    },
    setClip (context) {
        context.save()
        context.beginPath()
        context.fillStyle = '#0aa'
        context.arc(100, 100, 100, 2 * Math.PI, false)
        context.clip();
        context.clip()
        let img = new Image()
        img.src = require("@/assets/image/01eb485e44bf8fa8012165187fa336.jpg@1280w_1l_2o_100sh.jpg")
        img.onload = function() {
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
    },
    drawCircular (context) {
        context.shadowColor = "#545454";
        context.shadowOffsetX = 5;
        context.shadowOffsetY = 5;
        context.shadowBlur = 2;
        context.globalCompositeOperation = 'source-over'

        context.fillStyle = "#00AAAA"
        context.arc(200, 200, 100, 0, Math.PI * 2 ,false)
        context.arc(200, 200, 115, 0, Math.PI * 2 ,true)
        context.fill()
    }
}