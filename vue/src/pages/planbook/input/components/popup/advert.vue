<template>
	<div class="mainPopupDiv" @click="ckCloseBtn" v-if="showAdvert">
		<div class="advertContentDiv" @click.stop="" @touchmove.stop.prevent>
			<div>
				<img v-if="advertData.image" :src="advertData.image"/>
				<p class="desc">{{advertData.description}}</p>
				<footer class="popupOkBtn">
					<span :data-stat-id="`TKGG_QX_${advertData.id}`" @click="ckCloseBtn">{{advertData.extendData ? JSON.parse(advertData.extendData).cancelTx : '残忍拒绝'}}</span>
					<span class="active" :data-stat-id="`TKGG_QD_${advertData.id}`" @click="confirmCover">{{advertData.extendData ? JSON.parse(advertData.extendData).confirmTx : '点击查看'}}</span>
				</footer>
			</div>
		</div>
	</div>
</template>

<script>
	import helperJs from '@/utils/helper'
	export default {
		name: 'PopupAdvert',
		data () {
			return {
				showAdvert: false,
				advertData: {
					id: null,
					image: '',
					description: '',
					link: '',
					name: '',
					extendData: {
						cancelTx: '',
						confirmTx: ''
					}
				}
			}
		},
		props: ['popupAdverts'],
		created () {
			this.isShowAdvert()
		},
		mounted () {
			setTimeout( () => {
				window.WeiyiStatSDK && window.WeiyiStatSDK.submit(`TKGG_${this.advertData.id}`, {
				})
			}, 500)
		},
		methods: {
			isShowAdvert() {
			    if (this.popupAdverts && this.popupAdverts.length) {
			    	this.advertData = {
			    		...this.popupAdverts[0]
			    	}
			        let pbInput_advert = localStorage.getItem('pbInput_advert') ? localStorage.getItem('pbInput_advert').split('_') : []
			        if (!pbInput_advert[0] //没弹出过
			        	|| (new Date() > pbInput_advert[0] * 1 + 7 * 24 * 60 * 60 * 1000)  //上一次弹出时间是7天前
			        	|| (pbInput_advert[2] < 2 && pbInput_advert[1] != this.advertData.id) //7天内的弹框不超过2次，且第一次弹出时，点击的是确定
			        ) {
			        	this.showAdvert = true
			        	helperJs.stopBodyScroll(true)
			        }
			    }
			},
			confirmCover () {
				helperJs.stopBodyScroll(false)
				this.showAdvert = false
				let pbInput_advert = localStorage.getItem('pbInput_advert') ? localStorage.getItem('pbInput_advert').split('_') : []
				localStorage.setItem('pbInput_advert', `${new Date().getTime()}_${this.advertData.id}_${pbInput_advert[2] < 2 ? pbInput_advert[2] * 1 + 1 : 1}`)
				location.href = this.advertData.link
			},
			ckCloseBtn () {
				helperJs.stopBodyScroll(false)
				this.showAdvert = false
				localStorage.setItem('pbInput_advert', `${new Date().getTime()}_${this.advertData.id}`)
			}
		}
	}
</script>

<style>
	@import 'variables.css';
	.mainPopupDiv {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1000;
		background: rgba(0, 0, 0, 0.4);
		font-size: 32px;
		& .advertContentDiv {
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translateX(-50%) translateY(-50%);
			width: 65%;
			background: #fff;
			border-radius: 8px;
			overflow: hidden;
			& img {
				width: 100%;
			}
			& p {
				line-height: 145%;
				color: var(--gray_333);
				padding: 50px 32px;
			}
			& .popupOkBtn {
				display: flex;
			    width: 100%;
			    height: 100px;
			    line-height: 100px;
			    color: #fff;
			    text-align: center;
			    z-index: 300;
			    border-top: 1px solid var(--gray_e5);
			    overflow: hidden;
			    color: var(--gray_999);
			    & span {
			        flex: 1;
			        &.active {
			    		color: var(--mainColor_blue);
			    		border-left: 1px solid var(--gray_e5);
			        }
			    }
			}
		}
	}
</style>
