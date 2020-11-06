<template>
	<div class="pb_customer_trends" @click="gotoCustomerTrends">
		<i class="iconfont icon-inform"></i>
		<span>获客动态: xxxx 2分钟前阅读</span>
		<i class="iconfont icon-arrows_right"></i>
	</div>
</template>
<script>
	export default {
		name: 'CustomerTrends',
		data () {
			return {
			}
		},
		props: {
		},
		created () {
		},
		methods: {
			gotoCustomerTrends () {
				location.href = `bxs://crm/fm/client?cid=xxx`
			},
			ckCancel () {
				localStorage.setItem('pbInput_authentication', 'done')
				this.showAuthentication = false
			}
		}
	}
</script>
<style>
@import 'variables.css';
.pb_customer_trends {
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
	& i.icon-arrows_right {
		padding: 10px;
		color: var(--gray_ccc);
		@mixin vertical_center;
		right: 10px;
	}
}
</style>