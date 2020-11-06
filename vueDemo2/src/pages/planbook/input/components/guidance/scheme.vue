<template>
    <div class="guidancePopupDiv" @click.stop="ckClosePopup" @touchmove.stop.pervent>
        <div class="guidance" :style="{
            top: topTips.component ? '2.5rem' : '1rem'
        }" @click.stop="ckClosePopup">
            <img
                class="scheme_guide"
                src="//img.winbaoxian.com/autoUpload/planbook/input_scheme_guide_38535ce6cfa60ab.png">
        </div>
    </div>
</template>

<script>
    export default {
        name: 'GuidanceScheme',
        data () {
            return {
            }
        },
        props: ['topTips'],
        methods: {
            ckClosePopup () {
                this.$parent.showSchemeGuide = false
                localStorage.setItem('pbSchemeGuide', 'done')
            }
        }
    }
</script>

<style scoped>
    @import 'variables.css';
    .guidancePopupDiv {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 200;
        & .guidance {
            position: absolute;
            top: 0;
            right: 0;
            text-align: right;
            & .scheme_guide {
                width: 63%;
            }
        }
    }
</style>

