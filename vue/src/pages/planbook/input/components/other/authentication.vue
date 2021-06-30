<template>
	<div class="pb_authen">
		<i class="iconfont icon-inform" @click="gotoAuthen"></i>
		<span @click="gotoAuthen">根据监管要求，从事保险业务需</span>
		<span class="authen_button" @click="gotoAuthen">进行从业资格认证 <i class="iconfont icon-arrows_right"></i></span>
		<i class="iconfont icon-close_circle_surface" @click="ckCancel"></i>
	</div>
</template>
<script>
	export default {
		name: 'authentication',
		data () {
			return {
			}
		},
		props: {
			topTips: Object
		},
		created () {
		},
		methods: {
			gotoAuthen () {
				location.href = this.topTips.authenticationUrl
			},
			ckCancel () {
				localStorage.setItem('pbInput_authentication', 'done')
				this.topTips.showTips = false
			}
		}
	}
</script>
<style>
@import 'variables.css';
.pb_authen {
	position: relative;
	line-height: normal;
	padding: 17px 30px;
	background: #FFFEED;
	font-size: 24px;
	& i.icon-inform {
		color: #FF9900;
		font-size: 36px;
		vertical-align: middle;
	}
	& span {
		margin-left: 10px;
		vertical-align: middle;
		&.authen_button {
			margin-left: 0;
			color: #508CEE;
			& i.icon-arrows_right {
				font-size: 24px;
			}
		}
	}
	& i.icon-close_circle_surface {
		padding: 10px;
		color: var(--gray_ccc);
		@mixin vertical_center;
		right: 10px;
	}
}
</style>