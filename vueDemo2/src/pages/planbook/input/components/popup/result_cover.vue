<template>
	<div class="mainPopupDiv" @click="ckCloseBtn">
		<div class="coverListContentDiv" @click.stop="" @touchmove.stop.prevent>
			<header class="coverListTitle clearFloat">
				<span>收件封面</span>
				<i class="iconfont icon-close_line" @click="ckCloseBtn"></i>
			</header>
			<div class="popupCoverListDiv">
				<ul class="coverUl">
					<li v-for="cov in coverList" @click="chooseCover(cov)">
						<figure>
							<img :src="`${cov.img}?x-oss-process=image/resize,w_220`">
							<span class="bgCover" v-if="coverId === cov.id">
								<i class="iconfont icon-choose_done_line"></i>
							</span>
						</figure>
						<figcaption>{{cov.name}}</figcaption>
					</li>
				</ul>
			</div>
			<footer class="popupOkBtn">
				<span data-stat-id="sjfmqd" @click="confirmCover">确定</span>
			</footer>
		</div>
	</div>
</template>

<script>
	import helperJs from '@/utils/helper'
	export default {
		name: 'PopupResultCover',
		data () {
			// {val: 'healthy', desc: '健康'},
			// {val: 'accident', desc: '意外'},
			// {val: 'financing', desc: '理财'},
			// {val: 'financing2', desc: '理财(深金)'},
			// {val: 'financing3', desc: '理财(金)'},
			// {val: 'diff', desc: '开门红'}
			let allCovers = [
				{
					img: '//img.winbaoxian.com/autoUpload/planbook/common_1_839b5b537f46fe4.jpg',
					id: 0,
					name: '模板1',
					theme: 'common'
				}, {
					img: '//img.winbaoxian.com/autoUpload/planbook/common_2_26560cc87b70c6c.jpg',
					id: 2,
					name: '模板2',
					theme: 'common'
				}, {
					img: '//img.winbaoxian.com/autoUpload/planbook/healthy_1_1fc7963c0406ebd.jpg',
					id: 3,
					name: '模板3',
					theme: 'healthy'
				}, {
					img: '//img.winbaoxian.com/autoUpload/planbook/financing_1_857d26685eb34e8.jpg',
					id: 4,
					name: '模板4',
					theme: 'accident'
				}, {
					img: '//img.winbaoxian.com/autoUpload/planbook/financing_2_a5eb3c4464255e6.jpg',
					id: 5,
					name: '模板5',
					theme: 'financing2'
				}, {
					img: '//img.winbaoxian.com/autoUpload/planbook/financing_2_a5eb3c4464255e6.jpg',
					id: 5,
					name: '模板5',
					theme: 'financing3'
				}, {
					img: '//img.winbaoxian.com/autoUpload/planbook/-_a304e78efa5772e.jpg',
					id: 6,
					name: '模板6',
					theme: 'healthy'
				}, {
					img: '//img.winbaoxian.com/autoUpload/planbook/-_c1bba71e65f7ae0.jpg',
					id: 7,
					name: '模板7',
					theme: 'financing'
				}, {
					img: '//img.winbaoxian.com/autoUpload/planbook/-_4f516a4010a2ed3.jpg',
					id: 8,
					name: '模板8',
					theme: 'common'
				}, {
					img: '//img.winbaoxian.com/autoUpload/planbook/-_46a2edae73071b5.jpg',
					id: 9,
					name: '模板9',
					theme: 'common'
				}, {
					img: '//img.winbaoxian.com/autoUpload/planbook/__a394b023b210d03.jpg',
					id: 10,
					name: '模板10',
					theme: 'common'
				}
			]


			//微易经济公司下显示
			if (this.allInputData.companyId && this.allInputData.companyId === 40) {
				allCovers.push({
					img: '//media.winbaoxian.com/autoUpload/planbook/__2e32188fac8fd89.jpg',
					id: 11,
					name: '模板11',
					theme: 'common'
				})
			}

			let recipientInfo = this.allInputData.inputData.personData.recipientInfo
			return {
				recipientInfo,
				coverId: recipientInfo.coverId,
				coverName: recipientInfo.coverName,
				coverList: allCovers.filter( ele => {
					return ele.theme === 'common' || ele.theme === (this.allInputData.inputData.theme || 'healthy')
				})
			}
		},
		props: ['allInputData'],
		methods: {
			chooseCover (cover) {
				this.coverId = cover.id
				this.coverName = cover.name
			},
			confirmCover () {
				this.$set(this.recipientInfo, 'coverId', this.coverId)
				this.$set(this.recipientInfo, 'coverName', this.coverName)


				this.$set(this.allInputData.inputData, 'coverId', this.coverId)
				this.$set(this.allInputData.inputData, 'coverName', this.coverName)
				this.ckCloseBtn()
			},
			ckCloseBtn () {
				helperJs.stopBodyScroll(false)
				this.allInputData.popupData.popupName = ''
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

		& .coverListContentDiv {
			position: absolute;
			bottom: 0;
			width: 100%;
			height: 80%;
			padding-top: 45px;
			padding-bottom: 120px;
			-webkit-overflow-scrolling: touch;
			background: #fff;
			box-shadow: 0 -2px 2px 1px rgba(0, 0, 0, 0.15);
			& .coverListTitle {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				padding: 24px 4% 30px 4%;
				background: #fff;

				font-weight: bold;
				text-align: center;
				border-bottom: 1px solid var(--gray_e5);
				z-index: 500;
				& i {
					right: 4%;
					font-size: 20px;
					margin-top: -10px;
					color: #d8d8d8;
					@mixin fontIconCenter
				}
			}
			& .popupCoverListDiv {
				font-size: 14px;
				overflow: auto;
				-webkit-overflow-scrolling: touch;
				height: 100%;
				& ul {
					padding: 16px;
					& li {
						display: inline-block;
						width: 25%;
						padding: 14px;
						text-align: center;
						& figure {
							position: relative;
							& span.bgCover {
								position: absolute;
								top: 0;
								left: 0;
								display: inline-block;
								width: 100%;
								height: 100%;
								background: rgba(0, 0, 0, 0.5);
								& i {
									position: absolute;
									top: 50%;
									left: 50%;
									transform: translateX(-50%) translateY(-50%);
									font-size: 48px;
									color: #fff;
								}
							}
						}
						& figcaption {
							width: 100%;
							margin-top: 12px;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
							font-size: 28px;
						}
					}
				}
			}
			& .popupOkBtn {
			    position: fixed;
			    bottom: 0;
			    left: 0;
			    width: 100%;
			    height: 100px;
			    line-height: 100px;
			    color: #fff;
			    background: #f8f8f8;
			    text-align: center;
			    z-index: 300;
			    font-size: 26px;
			    padding-bottom: constant(safe-area-inset-bottom);
			    padding-bottom: env(safe-area-inset-bottom);
			    box-sizing: content-box;
			    border-top: 1px solid var(--gray_e5);
			    border-radius: 4px;
			    overflow: hidden;
			    & span {
			        display: inline-block;
			        width: 94%;
			        height: 70px;
			        line-height: 70px;
			        margin: 16px auto 0;
			        border-radius: 4px;
			        background: var(--mainColor_blue);
			    }
			}
		}
	}
</style>
