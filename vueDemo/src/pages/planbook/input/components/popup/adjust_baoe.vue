<template>
	<!-- 追加保费组件 -->
	<div class="mainPopupDiv" @click="ckClosePopup">
		<div class="mainContentDiv" @click.stop="">
			<div class="changeAccountDataDIv clearFloat">
				<p>
					<label>
						<em class="active">调整保额</em>
					</label>
				</p>
				<p style="border: none; margin-bottom: 0.5rem; font-size: 0.875rem; color: #999;">在指定年龄，保额调整为如下金额：</p>
				<transition-group name="list" tag="ul" class="clearFloat">
					<li class="clearFloat list-item" v-for="ele in formEleData" :key="ele.key" >
						<component :is='ele.componentName' :ele-data='ele' :module-data='adjustData' @changeEleData='changeInputData'></component>
					</li>
				</transition-group>

				<div class="tableTitle" v-if="adjustBaoeData && adjustBaoeData.length">
					<h5 class="atTitleH5">调整记录</h5>
					<span @click="curProdData.adjustBaoeData = []; adjustBaoeData = []">清空</span>
				</div>
				<div style="overflow-x: auto;">
					<table v-if="adjustBaoeData && adjustBaoeData.length">
						<thead>
							<tr>
								<td v-for="(value, key, vIdx) in adjustBaoeData[0]" :key="key">
									{{getAdjustBaoeInsTitle(curProdData.mulInsOrderList, key)}}
								</td>
							</tr>
						</thead>
						<transition-group name="list" tag="tbody">
							<tr v-for="(adjust, idx) in adjustBaoeData" :key="JSON.stringify(adjust)" class="list-item">
								<td v-for="(value, key, vIdx) in adjust" :key="key">
									{{value}}
									<i v-if="Object.keys(adjust).length - 1 == vIdx" class="iconfont icon-close_circle_surface floatRight" @click="deleteCurRecord(adjustBaoeData, idx)"></i>
								</td>
							</tr>
						</transition-group>
					</table>
				</div>
			</div>
			<div class="warnDiv">
				温馨提示：以上演示说明为本平台对上述产品的理解便于保险从业人员学习、交流，演示数据仅供参考，请以实际为准。
			</div>
			<footer class="popupOkBtn">
				<span @click='ckPopupOkFn'>保存所有记录</span>
				<span :class="okDisabled ? 'disabled' : ''" @click="ckAddAndTakeOkFn"></i> 添加调整记录 </span>
			</footer>
		</div>
	</div>
</template>

<script>
	import helperJs from '@/utils/helper'
	import {
	    baseApiPath,
	    planbookId
	} from '@/utils/index'

	import cmCommonInputSever  from '../atomComponentsv2/common_form_input_sever.vue'
	import cmCommonSelectSever from '../atomComponentsv2/common_form_select_sever.vue'
	export default {
		name: 'PopupAdjustBaoe',
		data () {
			let curModuleData = this.allInputData.curModuleData
			let curProdData = helperJs.deepCopy({}, curModuleData.curProdData)
			let curInsData = helperJs.deepCopy({}, curModuleData.curInsData)
			let formEleData = [
				{
					key: 'age',
					componentName: 'cmCommonSelectSever',
					labelName: '调整年龄',
					opts: []
				}
			]
			let adjustData = {
				age: helperJs.filterArr(this.allInputData.inputData.personData.personOrderList[0].eleOrderList, 'age').value + 1
			}

			curProdData.mulInsOrderList.map(function (ins, idx) {
				if (ins.adjustBaoe && !ins.groupKey && helperJs.getArraySubEle(ins.eleOrderList, 'key', 'title') && helperJs.getArraySubEle(ins.eleOrderList, 'key', 'title').value) {
					let groupChosen
					if (ins.isGroup) {
						groupChosen = curProdData.mulInsOrderList.filter(function (gIns, gI) {
							return gIns.key == helperJs.getArraySubEle(ins.eleOrderList, 'key', 'insuranceId').value
						})[0]
					}
					formEleData.push({
						key: `baoe_${(groupChosen || ins).code || (groupChosen || ins).key}`,
						componentName: 'cmCommonInputSever',
						labelName: (/(\(|\（)([^\(\（]+)(\)|\）)$/.exec((groupChosen || ins).name) && /(\(|\（)([^\(\（]+)(\)|\）)$/.exec((groupChosen || ins).name)[2]) || (groupChosen || ins).name,
						placeholder: '请输入调整金额'
					})
					adjustData[`baoe_${(groupChosen || ins).code || (groupChosen || ins).key}`] = helperJs.getArraySubEle(ins.eleOrderList, 'key', 'baoe').value
				}
			})
			let adjustBaoeData = curProdData.adjustBaoeData ? curProdData.adjustBaoeData.slice(0) : []
			return {
				curModuleData,
				curProdData,
				curInsData,
				age: helperJs.filterArr(this.allInputData.inputData.personData.personOrderList[0].eleOrderList, 'age').value,
				adjustBaoeData,
				formEleData,
				adjustData,
				okDisabled: false,
				helperJs
			}
		},
		props: ['allInputData'],
		validator: {
		  // auto: true          // 初始化后自动检查
		},
		created () {
			helperJs.stopBodyScroll(true)
		},
		methods: {
			checkBalance () {
				let self = this
				helperJs.vueAxios({  //请求计算
					self,
					url: `${baseApiPath}/planBook/V2/validateAccount/-1/low`,
					data: self.$qs.stringify({jd: JSON.stringify({
						insuranceTypeId: planbookId,
						personData: helperJs.convertProductData(self.allInputData).personData,  //转换后的个人信息数据
						productGroupList: [
							{
								key: self.allInputData.popupData.relatedProduct[0],
								prodOrderList: [helperJs.convertProductData(self.allInputData, self.curProdData).productData],  //转换后的产品数据
							}
						]
					})})
				}, function (res) {
					self.okDisabled = false
					if (res.data.success) {
						self.curProdData.adjustBaoeData.sort(function (a, b) { return a.age - b.age})
						self.adjustBaoeData = self.curProdData.adjustBaoeData.slice(0)
					} else {
						self.curProdData.adjustBaoeData = self.adjustBaoeData.slice(0)
						self.$toast(res.data.info)
					}
				})
			},
			ckAddAndTakeOkFn () {
				var self = this
				if (self.okDisabled) {
					return
				}
				self.okDisabled = true
				helperJs.validateAllFn(0, helperJs.collectValidateVm(self, []), self, function () {
					self.curProdData.adjustBaoeData = self.curProdData.adjustBaoeData || []
					self.curProdData.adjustBaoeData.push({...self.adjustData})
					self.checkBalance()
				}, function($validation){
					self.okDisabled = false
					self.$toast('请输入正确信息')
					console.log($validation)
				})
			},
			deleteCurRecord (arr, index) {
				var self = this
				self.curProdData.adjustBaoeData.splice(index, 1)
				self.checkBalance()
			},
			ckPopupOkFn () {
				this.$set(this.curModuleData.curProdData, 'adjustBaoeData', this.adjustBaoeData)
				this.ckClosePopup()
			},
			ckClosePopup () {
				this.allInputData.popupData.popupName = ''
				helperJs.stopBodyScroll(false)
			},
			changeInputData (vmEle) {
				let self = this
				if (vmEle.validate) {
					helperJs.validateAllFn(0, helperJs.collectValidateVm(vmEle, []), vmEle)
				}
			},
			getAdjustBaoeInsTitle (mulInsOrderList, key) {
				let insData = mulInsOrderList.filter(function (ins, i) {
					return ins[ins.code ? 'code' : 'key'] == key.replace(/baoe_/, '')
				})[0]
				return key === 'age' ? "年龄" : (/(\(|\（)([^\(\（]+)(\)|\）)$/.exec(insData.name) ? /(\(|\（)([^\(\（]+)(\)|\）)$/.exec(insData.name)[2] : insData.name)
			}
		},
		watch: {
			"adjustData.age" (val, oldVal) {
				let self = this
				if (self.adjustBaoeData && self.adjustBaoeData.length && val >= self.adjustBaoeData[0].age) {
					let index
					self.adjustBaoeData.map(function(adjust, i) { //默认最小于当前年龄的最近一组数据
						if (index === undefined && adjust.age > val) {
							index = i - 1
						}
					})
					self.adjustData = {
						...self.adjustBaoeData[index === undefined ? self.adjustBaoeData.length - 1 : index],  //当前年龄大于记录列表最大年龄，则取列表中最后一组记录
						age: val
					}
				} else { //当前列表为空 或 当前年龄小于列表最小值，则从原险种数据中取值
					self.curProdData.mulInsOrderList.map(function (ins, idx) {
						if (ins.adjustBaoe && !ins.groupKey && helperJs.getArraySubEle(ins.eleOrderList, 'key', 'title') && helperJs.getArraySubEle(ins.eleOrderList, 'key', 'title').value) {
							let groupChosen
							if (ins.isGroup) {
								groupChosen = self.curProdData.mulInsOrderList.filter(function (gIns, gI) {
									return gIns.key == helperJs.getArraySubEle(ins.eleOrderList, 'key', 'insuranceId').value
								})[0]
							}
							self.adjustData[`baoe_${(groupChosen || ins).code || (groupChosen || ins).key}`] = helperJs.getArraySubEle(ins.eleOrderList, 'key', 'baoe').value
						}
					})
				}
			},
			adjustBaoeData: {
				deep: true,
				immediate: true,
				handler (val, old) {
					let self = this
					let addAges = self.adjustBaoeData.map(function(ad) { return ad.age})
					self.formEleData[0].opts = []
					for (let k = helperJs.filterArr(self.allInputData.inputData.personData.personOrderList[0].eleOrderList, 'age').value + 1; k <= 105; k++ ) {
						addAges.indexOf(k) === -1 && self.formEleData[0].opts.push({
							val: k,
							desc: k + '岁'
						})
					}
					self.formEleData[0].value = self.formEleData[0].opts[0].val
					self.adjustData.age = self.formEleData[0].value
				}
			}
		},
		components: {
			cmCommonInputSever,
			cmCommonSelectSever
		}
	}
</script>

<style scoped>
	@import 'variables.css';
	.mainPopupDiv {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0,0,0,0.4);
		z-index: 200;
		& .mainContentDiv {
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 90%;
			background: #F0EFF4;
			font-size: 30px;
			overflow: auto;
			padding-bottom: 120px;
			& .changeAccountDataDIv {
				width: 94%;
				margin: 24px auto;
				padding: 0 24px 24px 24px;
				background: #fff;
				border-radius: 4px;
				& p {
					display: -webkit-box;
					margin-bottom: 30px;
					border-bottom: 1px solid var(--gray_e5);
					& label {
						display: -webkit-box;
						-webkit-box-flex: 1;
						-webkit-box-align: center;
						-webkit-box-pack: center;
						& em {
							display: inline-block;
							padding: 24px 16px 16px 24px;
							color: var(--gray_999);
							&.active {
								border-bottom: 3px solid var(--mainColor_blue);
								color: var(--mainColor_blue);
							}
						}
					}
				}
				& > ul {
					border: 1px solid var(--gray_e5);
					& li {
						position: relative;
						padding-left: 24px;
						padding-right: 24px;
						border-bottom: 1px solid var(--gray_e5);
						&:last-child {
							border-bottom: none;
						}
						& .selectCommonDiv {
							display: inline-block;
							position: relative;
							margin-top: 16px;
							@mixin floatRight;
							& select {
								padding-right: 48px;
								height: 60px;
								line-height: 60px;
								font-size: 30px;
							    & em.upArrowIcon.disabled {
							      border-bottom-color: #ccc;
							      border-right-color: #ccc;
							    }
							}
						}
						& label {
							max-width: 50%;
							@mixin nowrap;
						}
						& input {
							@mixin floatRight;
							margin-top: 24px;
						}
						& i {
							@mixin fontIconCenter;
							top: 50%;
							&.icon-add {
								position: initial;
								vertical-align: 0;
								font-weight: bold;
							}
						}
					}
				}
				& .tableTitle {
					position: relative;
					margin-top: 32px;
					padding: 24px 16px 20px;
					text-align: left;
					border: 1px solid var(--gray_e5);
					& h5 {
						width: 65%;
						font-size: 32px;
						text-align: left;
						@mixin nowrap;
					}
					& span {
						color: var(--mainColor_blue);
						@mixin fontIconCenter;
						right: 16px;
					}
				}
				& table {
					width: 100%;
					border-collapse: collapse;
					& thead, & tbody {
						& tr {
							display: table-row;
							& td {
								position: relative;
								border-bottom: 1px solid var(--gray_e5);
								border-left: 1px solid var(--gray_e5);
								text-align: left;
								min-width: 48px;
								color: var(--gray_999);
								vertical-align: middle;
								padding: 20px 16px 16px;
								&:first-child {
									text-align: center;
								}
								&:last-child {
									border-right: 1px solid var(--gray_e5);
									padding-right: 28px;
								}
								& i {
									@mixin fontIconCenter;
									padding: 8px;
									color: var(--gray_999);
									right: 10px;
									margin-top: -22px;
								}
							}
						}
					}
					& thead {
						& tr {
							& td {
								text-align: center;
							}
						}
					}
				}
			}
			& .warnDiv {
				width: 94%;
				margin: 0 auto 32px;
				font-size: 24px;
				color: var(--gray_999);
			}
			& .popupOkBtn {
				position: fixed;
				bottom: 0;
				left: 0;
				width: 100%;
				height: 100px;
				line-height: 100px;
				color: #fff;
				text-align: center;
				z-index: 300;
				font-size: 32px;
				background: #f8f8f8;
				padding-bottom: constant(safe-area-inset-bottom);
				padding-bottom: env(safe-area-inset-bottom);
				box-sizing: content-box;
				text-align: right;
				border-top: 1px solid var(--gray_e5);
				overflow: hidden;
				& span {
					display: inline-block;
					min-width: 152px;
					height: 70px;
					line-height: 70px;
					margin-top: 16px;
					margin-right: 18px;
					color: var(--gray_999);
					background: #fff;
					text-align: center;
					border-radius: 2px;
					padding: 0 32px;
					&:last-child {
						background: var(--mainColor_blue);
						color: #fff;
						margin-right: 30px;
					}
					&.disabled {
						color: #fff!important;
						background: var(--gray_ccc);
					}
				}
			}
		}
	}
</style>
