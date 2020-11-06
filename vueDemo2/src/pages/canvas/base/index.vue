<template>
  <div class="canvas_base_wrap">
    <canvas
        id="canvas_base"
        :width="window.innerWidth"
        :height="window.innerHeight"
    ></canvas>
</div>
</template>
<script>
import Draw from './draw.js'
export default {
name: 'app',
data() {
    return {
        window
    }
},
created () {
},
mounted () {
    this.getContext().then(context => {
        this.drawStart(context)
    })
},
methods: {
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
    drawStart (context) {
        //绘制线条
        // Draw.drawLine(context)
        // Draw.drawBrokenLine(context)
        // Draw.drawMultBrokenLine(context)
        // Draw.createLinearGradient(context)
        // Draw.createRadialGradient(context)
        // Draw.createPattern(context)
        // Draw.drawArc(context)
        // Draw.drawArcTo(context)
        // Draw.drawQuadraticCurveTo(context)
        // Draw.drawBezierCurveTo(context)
        // Draw.drawText(context)
        // Draw.transform(context)
        // Draw.setShadow(context)
        // Draw.drawImage(context)
        Draw.setClip(context)
        // Draw.drawCircular(context)
    }
},
components: {}
}
</script>
<style>
    @import 'index.css'
</style>