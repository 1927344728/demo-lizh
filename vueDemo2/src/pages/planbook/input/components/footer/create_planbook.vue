<template>
	<div class="createPlanbookDiv footer_remove_disabled">
		<ul class="record_input_create_footer" v-if="pBType ==='record'">
			<li>
				<a href="javascript:;" data-stat-id="KSSL"  @click="beginDoubleRecord">开始双录</a>
			</li>
		</ul>
		<ul class="normal_input_create_footer" v-else-if="!pBType">
			<li class="make_image_and_PDF">
				<a href="javascript:;" data-stat-id="PIC"  @click="gotoMakeImageOrPDF('image')">
					<p><i class="iconfont icon-add_image"></i></p>
					<span>生成图片</span>
				</a>
				<a href="javascript:;" data-stat-id="PDF" @click="gotoMakeImageOrPDF('PDF')">
					<p><i class="iconfont icon-_huaban"></i></p>
					<span>生成PDF</span>
				</a>
			</li>
			<li class="totalBaofLi">
				<div class="total_baof_wrapper">
					<p class="totalBaofTag">首年总保费</p>
					<p class="totalBaofVal"> {{getTotalBaof(totalBaof)[0] || '0'}}<em>.{{getTotalBaof(totalBaof)[1] || '00'}}元</em></p>
				</div>
				<a href="javascript:;" class="active" @click="gotoMakePlanbook">
					<span>生成计划书</span>
				</a>
			</li>
		</ul>
		<ul class="createPlanbookUl" v-else>
			<li class="totalBaofLi">
				<p class="totalBaofTag">首年总保费</p>
				<p class="totalBaofVal"> {{getTotalBaof(totalBaof)[0] || '0'}}<em>.{{getTotalBaof(totalBaof)[1] || '00'}}元</em></p>
			</li>
			<li>
				<!-- 保单整理 -->
				<a href="javascript:;" class="" @click="gotoMakePlanbook" data-stat-id="bdzl_yl" v-if='pBType.match("insPolicy1")'>预览</a>
				<a href="javascript:;" class="active" @click="goToPolicy" data-stat-id="bdzl_bc" v-if='pBType.match("insPolicy1")'>生成保单</a>

				<!-- 家庭计划书 -->
				<a href="javascript:;" class="" @click="gotoMakePlanbook" data-stat-id="JTJHS_YL" v-if='pBType.match("familyPlan")'>预览</a>
				<a href="javascript:;" class="active" @click="goToFamilyPlan" data-stat-id="JTJHS_JR" v-if='pBType == "familyPlan"'>加入家庭计划</a>
				<a href="javascript:;" class="active" @click="joinFamilyPlan2" data-stat-id="JTJHS_JR" v-if='pBType == "familyPlan2"'>加入家庭计划</a>

				<!-- 多计划书对比 -->
				<a href="javascript:;" class="active" @click="goToMultPBCompare" data-stat-id="DJHSDBTBY_BC" v-if='pBType.match("multPBCompare")'>加入对比</a>

				<!-- 视频计划书 -->
				<a href="javascript:;" class="active" @click="goToVideoPlanbook" data-stat-id="JTJHS_SP" v-if='pBType.match("video")'>
					生成视频计划书
				</a>
			</li>
		</ul>
	</div>
</template>

<script>
	import helperJs from '@/utils/helper'
	import {
	    baseApiPath,
	    planbookId,
	    pBType,
	    resultUuid

	} from '@/utils/index'
	export default {
		name: 'createPlanbook',
		data () {
			return {
				pBType: pBType || '',
				resultType: helperJs.getUrlParam('resultType')
			}
		},
		props: ['planbookData'],
		created () {
			window.appBridge && appBridge.$on('AppBackToInputPage', function () {
				Array.prototype.slice.apply(document.getElementsByClassName('footer_remove_disabled')[0].getElementsByTagName('a')).map(function(ele) {
					ele.classList.contains('disabled') && ele.classList.remove('disabled')
				})
			})
		},
		methods: {
			gotoMakePlanbook: function (successFn) {
				helperJs.makePlanbook({ self: this })
			},
			beginDoubleRecord () {
				let personOrderList = helperJs.convertProductData(this).personData.personOrderList
				if (!personOrderList[0].name) {
					this.$toast('请输入被保人姓名')
					return
				}
				if (!personOrderList[1].applicantAndInsuredSame && !personOrderList[1].name) {
					this.$toast('请输入投保人姓名')
					return
				}

				helperJs.makePlanbook({
					self: this,
					url: `${baseApiPath}/planBook/V2/createDoubleRecordResult`,
					successFn (res) {
						location.href = `https://pbf.winbaoxian.${location.hostname.search(/pbf\.winbaoxian\.com/) !== -1 ? 'com' : 'cn'}/planBook/planbookAccessories/double-recording/entry.html?nw=1&uuid=${res.data.data}`
					}
				})
			},
			goToPolicy () {
				let self = this
				let insuredInfo = helperJs.getArraySubEle(self.planbookData.personData.personOrderList, 'key', 'insuredInfo')
				let applicantInfo = helperJs.getArraySubEle(self.planbookData.personData.personOrderList, 'key', 'applicantInfo')

				helperJs.makePlanbook({
					self,
					successFn: function (res) {
						let reqData = {
					  		id: window.gPolicyId,
					  		mainUuid: helperJs.getUrlParam('cId'),
					  		userUuid: helperJs.getUrlParam('userUuid'),
						  	insuredId: gCrmId,  //被保人ID
						  	insuranceDay: new Date(helperJs.getArraySubEle(insuredInfo.eleOrderList, 'key', 'insuranceDay').value).getTime(), //投保日
						  	holderId: !!applicantInfo && helperJs.getArraySubEle(applicantInfo.eleOrderList, 'key', 'title').value ? helperJs.getArraySubEle(applicantInfo.eleOrderList, 'key', 'activeMemberId').value : '',  //投保人ID
						  	resultUuid: res.data.data,  //结果页UUID
						}
						if (helperJs.getUrlParam('ocrId')) {
							reqData.ocrId = helperJs.getUrlParam('ocrId')
						}
						if (helperJs.getUrlParam('tocOcrId')) {
							reqData.tocOcrId = helperJs.getUrlParam('tocOcrId')
						}

					  	helperJs.vueAxios({  //请求计算
						  	self,
						  	url: `${baseApiPath}/planBook/insurePlan/saveInsurance`,
						  	data: reqData
						}, function (sRes) {
							if (sRes.data.success) {
								history.go(helperJs.getUrlParam('from') === 'search' ? -2 : -1)
							} else {
								self.$toast(sRes.data.info)
							}
						})
					}
				})
			},
			goToFamilyPlan () {
				let self = this
				helperJs.makePlanbook({
					self,
					successFn: function (res) {
					  	helperJs.vueAxios({  //请求计算
						  	self,
						  	url: `${baseApiPath}/planBook/MultiplayerInsure/savePlayerList`,
						  	data: {
						  		multiUuid: helperJs.getUrlParam('multiUuid') || null,
						  		relationId: helperJs.getUrlParam('relationId') || null,
							  	resultUuid: res.data.data,  //结果页UUID
							}
						}, function (sRes) {
							if (sRes.data.success) {
								if (helperJs.getUrlParam('multiUuid')) {
									history.go(helperJs.getUrlParam('from') === 'search' ? -2 : -1)
								} else {
									let url = `${globalHostName}/planBook/projectGroup/familyPlan/pbList.html?nw=1&multiUuid=${sRes.data.data}`
									if (location.hostname.search(/localhost|192\.168\./) !== -1) {
										url = `${location.protocol}//${location.hostname}:9200/familyPlan/pbList.html?nw=1&multiUuid=${sRes.data.data}`
									}
									location.href = url
								}
							} else {
								self.$toast(sRes.data.info)
							}
						})
					}
				})
			},
			joinFamilyPlan2 () {
				let self = this
				var urlParam = JSON.parse(decodeURIComponent(helperJs.getUrlParam('param')))
				helperJs.makePlanbook({
					self,
					successFn: function (res) {
					  	helperJs.vueAxios({  //请求计算
						  	self,
						  	url: `${baseApiPath}/planBook/family/insurance/save`,
						  	data: {
						  		id: helperJs.getUrlParam('policyId') * 1 || helperJs.getUrlParam('policyId'), //familyId，家庭保障id	string
						  		resultUuid: res.data.data, //结果页UUID	string
						  		unactiveMemberId: urlParam && urlParam.personData && urlParam.personData[0] &&  urlParam.personData[0].id, //被保人id
						  		activeMemberId: urlParam && urlParam.personData && urlParam.personData[1] &&  urlParam.personData[1].id ,  //投保人ID
							}
						}, function (sRes) {
							if (sRes.data.success) {
								history.go(helperJs.getUrlParam('from') === 'search' ? -2 : -1)
							} else {
								self.$toast(sRes.data.info)
							}
						})
					}
				})
			},
			goToMultPBCompare () {
				let self = this
				helperJs.makePlanbook({
					self,
					successFn: function (res) {
					  	let param = JSON.parse(decodeURIComponent(helperJs.getUrlParam('param')))
					  	let multUuid = param.multUuid || [];
					  	multUuid.push(res.data.data)
					  	let url = `${globalHostName}/planBook/planbookInput/pages/other/multPBCompare/multPBCompare.html?person=${encodeURIComponent(JSON.stringify(param.personData))}&multUuid=${encodeURIComponent(JSON.stringify(multUuid))}`
					  	if (location.hostname.search(/localhost|192\.168\./) !== -1) {
					  		url = `${location.protocol}//${location.hostname}:9600/other/multPBCompare/multPBCompare.html?person=${encodeURIComponent(JSON.stringify(param.personData))}&multUuid=${encodeURIComponent(JSON.stringify(multUuid))}`
					  	}
					  	history.replaceState(null, null, url)
					  	location.replace(url)
					}
				})
			},
			goToVideoPlanbook () {
				let self = this
				helperJs.makePlanbook({
					self,
					successFn: function (res) {
						let resData = res.data.data;
					  	location.href = `https://pbf.winbaoxian.${/pbf\.winbaoxian\.com/.test(window.location.hostname) ? 'com' : 'cn'}/planBook/projectGroup/videoPlanbook/product.html?uuid=${resData}`
					}
				})
			},
			goToAudioPlanbook () {
				let self = this
				if ( this.resultType === 'audio' && this.prodChooseNumber != 1) {
					this.$toast("该功能暂不支持组合场景")
					return
				}
				helperJs.makePlanbook({
					self,
					resultType: this.resultType,
					successFn: function (res) {
						let resData = res.data.data;
						var intellectScheme = localStorage.getItem('intellectScheme') ? JSON.parse(localStorage.getItem('intellectScheme')) : {}
						intellectScheme['s' + planbookId] = resData
						localStorage.setItem('intellectScheme', JSON.stringify(intellectScheme))
					  	location.href = `https://pbf.winbaoxian.${/pbf\.winbaoxian\.com/.test(window.location.hostname) ? 'com' : 'cn'}/planbook-innovative/?uuid=${resData}`
					}
				})
			},
			gotoMakeImageOrPDF (type) {
				let self = this
				helperJs.makePlanbook({
					self,
					resultType: this.resultType,
					successFn: function (res) {
						let resData = res.data.data;
						var intellectScheme = localStorage.getItem('intellectScheme') ? JSON.parse(localStorage.getItem('intellectScheme')) : {}
						intellectScheme['s' + planbookId] = resData
						localStorage.setItem('intellectScheme', JSON.stringify(intellectScheme))

						let url
						if (type === 'image') {
							url = `${location.protocol}//pbf.winbaoxian.${location.hostname.search(/\.winbaoxian\.com/) === -1 ? 'cn' : 'com'}/planBook/planBookResult/pages/planbkChart.html?nw=1&theme=${self.planbookData.theme}&uuid=${resData}&coverId=${self.planbookData.coverId}`
							location.href = url
						} else if (type === 'PDF') {
							url = `${location.protocol}//app.winbaoxian.${location.hostname.search(/\.winbaoxian\.com/) === -1 ? 'cn' : 'com'}/planBook/pdfExport/pbResult?resultUuid=${resData}&v=${new Date().getTime()}`
							if (appBridge.isApp()) {
								const title = `${document.title}${helperJs.parseTime(
									new Date(),
									'{h}-{i}-{s}'
								)}`
								window.appBridge.handleFile({
									url,
									title,
									action: 'sharePdf'
								})
							} else {
								location.href = url
							}
						}
					}
				})
			},
			getTotalBaof(value) {
				return value.split('.')
			}
		},
		computed: {
			totalBaof: function () {
				let totalBaof = 0  //所有产品的保费和
				this.planbookData.productGroupList.map(function (group) {
					if (!group.isHide) {
						group.prodOrderList.map(function(prod){
							if (prod.hadChoice && !prod.hide) {
								totalBaof += prod.totalBaof * 1 || 0
							}
						})
					}
				});
				return totalBaof.toFixed(2)
			},
			prodChooseNumber () {
				let prodChooseNumber = 0  //所有产品的保费和
				this.planbookData.productGroupList.map(function (group) {
					if (!group.isHide) {
						group.prodOrderList.map(function(prod){
							if (prod.hadChoice && !prod.hide) {
								prodChooseNumber ++
							}
						})
					}
				});
				return prodChooseNumber
			}
		}
	}
</script>

<style scoped>
	@import 'variables.css';
	.createPlanbookDiv {
		position: fixed;
		bottom: 0;
		width: 100%;
		margin: 0 auto;
		margin-left: -3%;
		z-index: 100;
		border-top: 1px solid var(--gray_e5);
		background: #F8F8F8;
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
		box-sizing: content-box;
		& .normal_input_create_footer,
		& .record_input_create_footer {
			display: flex;
			width: 100%;
			height: 100px;
			line-height: 100px;
			padding: 0 3%;
			background: #F8F8F8;
			& li {
				flex: 2;
				font-size: 26px;
				text-align: left;
				vertical-align: top;
				white-space: nowrap;
				& a {
					display: inline-block;
					min-width: 4rem;
					line-height: normal;
					padding: 8px 12px;
					border: 1px solid #CCC;
					border-radius: 4px;
					text-align: center;
					background: #fff;
					color: #666;
					vertical-align: middle;
					& p {
						pointer-events: none;
					}
					& span {
						vertical-align: middle;
						pointer-events: none;
					}
					&.active {
						color: #fff;
						border: 1px solid var(--mainColor_blue);
						background: var(--mainColor_blue);
					}
					&.disabled {
						border: 1px solid #ccc;
						background: #ccc;
						color: #fff!important;
						& i.icon-inform {
							color: #fff;
						}
					}
				}
				&.make_image_and_PDF {
					& a {
						min-width: auto;
						padding: 8px 0;
						color: var(--gray_333);
						background: none;
						border: 0;
						& i {
							font-size: 36px;
							color: #666;
						}
						& span {
							font-size: 24px;
						}
						&.disabled {
							border: 0;
							background: none;
							color: #999!important;
						}
						&:first-child {
							margin-right: 20px;
						}
					}
				}
				&.totalBaofLi {
					flex: 3;
					line-height: 135%;
					color: var(--gray_333);
					text-align: right;
					& .total_baof_wrapper {
						display: inline-block;
						height: 100%;
						margin-right: 10px;
						vertical-align: middle;
						& p {
							&.totalBaofTag {
								line-height: 26px;
								font-size: 24px;
								padding-top: 16px;
							}
							&.totalBaofVal {
								width: 100%;
								margin-top: 10px;
								font-size: 40px;
								color: #FF5000;
								@mixin nowrap;
								& em {
									font-size: 24px;
								}
							}
						}
					}
				}
			}
		}
		& .record_input_create_footer {
			& li {
				& a {
					display: inline-block;
					width: 100%;
					line-height: normal;
					padding: 8px 12px;
					border-radius: 12px;
					text-align: center;
					background: #fff;
					color: #666;
					vertical-align: middle;
					color: #fff;
					border: 1px solid var(--mainColor_blue);
					background: var(--mainColor_blue);
					&.disabled {
						border: 1px solid #ccc;
						background: #ccc;
						color: #fff!important;
						& i.icon-inform {
							color: #fff;
						}
					}
				}
			}
		}
		& .createPlanbookUl {
			display: -webkit-box;
			width: 100%;
			height: 100px;
			line-height: 100px;
			padding: 0 3%;
			background: #F8F8F8;
			& li {
				margin-right: 9px;
				-webkit-box-flex: 1;
				-webkit-box-align: center;
				-webkit-box-pack: center;
				font-size: 26px;
				text-align: center;
				vertical-align: top;
				white-space: nowrap;
				& p {
					&.totalBaofTag {
						line-height: 26px;
						font-size: 24px;
						padding-top: 16px;
					}
					&.totalBaofVal {
						width: 100%;
						margin-top: 10px;
						font-size: 40px;
						color: #FF5000;
						@mixin nowrap;
						& em {
							font-size: 24px;
						}
					}
				}

				& a {
					display: inline-block;
					min-width: 4rem;
					line-height: normal;
					padding: 8px 12px;
					border: 1px solid #CCC;
					border-radius: 4px;
					text-align: center;
					background: #fff;
					color: #666;
					vertical-align: middle;
					& i.icon-inform {
						line-height: 100%;
						vertical-align: middle;
						font-size: 36px;
					}
					& span {
						vertical-align: middle;
					}
					&.fixedWidthBtn {
						padding: 8px 0;
						width: 3rem;
					}
					&.active {
						color: #fff;
						border: 1px solid var(--mainColor_blue);
						background: var(--mainColor_blue);
					}
					&.disabled {
						border: 1px solid #ccc;
						background: #ccc;
						color: #fff!important;
						& i.icon-inform {
							color: #fff;
						}
					}
				}
				&.totalBaofLi {
					line-height: 135%;
					color: var(--gray_333);
					text-align: left;
				}
				&:last-child {
					text-align: right;
					margin-right: 0;
				}
			}
		}
	}

</style>

