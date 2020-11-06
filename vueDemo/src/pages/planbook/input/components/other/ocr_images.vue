<template>
	<div class="previewImageDiv" v-if="tocOcrId">
		<header>
			<span>保单照片 <em>(共{{imageList.length}}张)</em></span>
			<hr>
		</header>
		<ul class="previewImageUl">
			<li v-for="(img, idx) in imageList" @click="showImageViewer(idx)">
				<img :src="img + '?x-oss-process=image/resize,m_mfit,h_200,w_200'">
			</li>
		</ul>
	</div>
</template>

<script>
	import helperJs from '@/utils/helper'
	import {
	    baseApiPath
	} from '@/utils/index'
	export default {
		name: 'OtherOcrImages',
		data () {
			return {
				cid: helperJs.getUrlParam('cId'),
				tocOcrId: helperJs.getUrlParam('tocOcrId'),
				imageList: []
			}
		},
		props: [],
		created () {
			this.getImageList()
		},
		methods: {
			getImageList () {
			  	this.tocOcrId && helperJs.vueAxios({  //请求计算
				  	self: this,
				  	url: `${baseApiPath}/planBook/insurePlan/2cOcr/get`,
				  	type: 'get',
				  	data: {
				  		cid: this.cid,
				  		ocrId: this.tocOcrId
				  	}
				},  (sRes) => {
					if (sRes.data.success && sRes.data.data) {
						this.imageList = sRes.data.data.images || []
					}
				})
			},
			showImageViewer (index) {
			    if (appBridge && appBridge.checkAppFeature('NATIVE_IMAGE_VIEWER')) {
			        appBridge.showImageViewer({
			            urls: this.imageList,
			            idx: index    // 【选填】当前显示的图片索引，0代表第一张
			        }).catch(function(e) {
			            console.log(e.name + '  ' + e.message);
			        });
			    }
			}
		},
		computed: {
		}
	}
</script>

<style scoped>
	@import 'variables.css';
	.previewImageDiv {
		border-radius: 8px;
		margin-bottom: 20px;
		background: #F8F8F8;
		overflow: hidden;
		& header {
			position: relative;
			height: 80px;
			line-height: 80px;
			margin-top: 10px;
			padding: 0 30px;
			font-size: 34px;
			color: var(--gray_333);
			font-weight: bold;
			& span {
				& em {
					color: var(--gray_999);
					font-size: 26px;
					font-weight: normal;
				}
			}
			& hr {
				position: absolute;
				top: 24px;
				left: 0px;
				width: 8px;
				height: 30px;
				border: none;
				background-color: #508CEE;
			}
		}
		& .previewImageUl {
			padding: 30px 4% 24px;
			overflow: auto;
			white-space: nowrap;
			& li {
				display: inline-block;
				width: 200px;
				height: 200px;
				margin-right: 30px;
				overflow: hidden;
				&:last-child {
					margin-right: 0;
				}
				& img {
					width: 100%;
				}
			}
		}
	}

</style>

