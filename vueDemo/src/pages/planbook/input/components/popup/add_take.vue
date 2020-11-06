<template>
	<!-- 追加保费组件 -->
	<div class="mainPopupDiv" @click="ckClosePopup" v-if="allBenefitData && allBenefitData.length">
		<div class="mainContentDiv" @click.stop="">
			<div class="showAccountDataDIv">
				<header>
					<em>{{curInsData.accountData.accountPart == 'addAndTake' ? '追加领取' : curInsData.accountData.accountPart == 'add' ? '追加保费' : '部分领取'}}</em>
					<i class="iconfont icon-close_line" @click="ckClosePopup"></i>
				</header>
				<p>因合规需求，低档收益下账户金额足够才能设置领取：</p>
				<ul class="bonusTypeUl">
					<li v-if="bonusTypeOpts && bonusTypeOpts.opts" >
						<select class="disabled" disabled @change="getBonusType(b.value)">
							<option v-for="(b, i) in bonusTypeOpts.opts" :value="b.value"> {{b.description}} </option>
						</select>
						<i class="iconfont icon-arrow_down"></i>
					</li>
					<li v-if="allAddAndTakeData.rate && allAddAndTakeData.rate.opts">
						<select class="disabled" disabled>
							<option v-for="(b, i) in allAddAndTakeData.rate.opts" :value="b.value">
								{{b.description}}({{(b.value * 100).toFixed(2)}}%)
							</option>
						</select>
						<i class="iconfont icon-arrow_down"></i>
					</li>
				</ul>
				<div class="accountDataDIv" v-if="popAccountData && popAccountData.ageOpts">
					<div class="selectAgeDiv">
						<select v-model='popAccountData.benefitAge' @change="changeBenifitAge()">
							<option v-for="(a, idx) in popAccountData.ageOpts" :value='a'>保单年度 {{idx + 1}} 年，被保人{{a}}岁时</option>
						</select>
						<em class="upArrowIcon"></em>
					</div>

					<ul v-if="popAccountData.benefitData">
						<li v-for="benefit in popAccountData.benefitData">
							<label>{{benefit.label}}</label>:
							<span>{{benefit.value ? Math.round(benefit.value) : 0}} </span>{{benefit.unit || '元'}}
						</li>
					</ul>
					<em id="borderArrowDown" class="borderArrowDown"></em>
				</div>
				<div class="changeAgeBar" v-if="popAccountData">
					<i class="iconfont icon-reduce" @touchstart.stop.prevent="changeBenifitAge(popAccountData.benefitAge - 1)"></i>
					<div class="progressBarDiv" id="progressBarDiv" @touchstart="ckProgressBar">
						<span id='progressBarPercent'></span>
						<em id='progressMoveBtn'
							@touchstart.prevent="startProgress"
							@touchmove.prevent="moveProgress"
						><i></i></em>
					</div>
					<i class="iconfont icon-add" @touchstart.stop.prevent="changeBenifitAge(popAccountData.benefitAge + 1)"></i>
				</div>
			</div>
			<div class="changeAccountDataDIv clearFloat">
				<p>
					<label v-if="curInsData.accountData.accountPart == 'addAndTake' || curInsData.accountData.accountPart == 'add'">
						<em :class="accountType == 'add' ? 'active' : ''" @click="getAccountType('add')">追加保费</em>
					</label>
					<label v-if="curInsData.accountData.accountPart == 'addAndTake' || curInsData.accountData.accountPart == 'take'">
						<em :class="accountType == 'take' ? 'active' : ''" @click="getAccountType('take')">部分领取</em>
					</label>
				</p>
				<transition-group name="list" tag="ul" class="clearFloat">
					<li class="clearFloat list-item" v-for="ele in formEleData" :key="ele.key" >
						<component :is='ele.componentName' :ele-data='ele' :module-data='adjustData' @changeEleData='changeInputData'></component>
						<p v-if="accountType == 'take' && ele.key === 'baof'">根据低档收益，最大领取金额约：{{getMinAmount()}} 元<br/>仅供参考，实际领取以保单账户价值为准</p>
					</li>
					<li key="use" class="clearFloat list-item" v-if="accountType == 'take'">
						<label class="popupLabel">用途</label>
						<div class="selectCommonDiv">
							<select v-model="adjustData.purposeType" id="purposeType">
								<option v-for="p in purposeOpts" :value="p">{{p}}</option>
							</select>
							<em class="upArrowIcon"></em>
						</div><br/>
						<input type="text" v-model.lazy="adjustData.purpose" placeholder="请输入用途" style="min-width: 50%; margin: 0 0 0.5rem 0;" v-if="adjustData.purposeType == purposeOpts[purposeOpts.length - 1]">
					</li>
				</transition-group>
				<!-- <div class="AddAndTakeOkBtnDiv" @click="ckAddAndTakeOkFn"><i class="iconfont icon-add"></i> {{accountType == 'add' ? '添加追加记录' : '添加领取记录'}}</div> -->
				<div>
					<table v-for="(account, index) in curInsData.accountData.addAndTakeData" v-if="account && account.adjustData && account.adjustData.length" :key="JSON.stringify(account)">
						<caption position="top" class="clearFloat">
							<h5 class="atTitleH5">{{account.key =='add' ? '追加记录': '领取记录'}}</h5>
							<span @click="deleteAllAccount(account.key)">清空</span>
						</caption>
						<transition-group name="list" tag="tbody">
							<tr v-for="(at, idx) in account.adjustData" v-if="account.adjustData && account.adjustData.length" :key="JSON.stringify(at)" class="list-item">
								<td>第{{at[0]}}年 - 第{{at[1]}}年</td>
								<td style="color: #508CEE;">{{at[2]}} 元<i class="iconfont icon-close_circle_surface floatRight" @click="deleteCurAccount(account.adjustData, idx)"></i></td>
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
				<span class="AddAndTakeOkBtnDiv" @click="ckAddAndTakeOkFn"></i> {{accountType == 'add' ? '添加追加记录' : '添加领取记录'}}</span>
			</footer>
		</div>
	</div>
</template>

<script>
	import helperJs from '@/utils/helper'

	import cmCommonInputSever  from '../atomComponentsv2/common_form_input_sever.vue'
	import cmCommonSelectSever from '../atomComponentsv2/common_form_select_sever.vue'
	export default {
		name: 'PopupAddTake',
		data () {
			let purposeOpts = ['高中教育金', '大学教育金', '婚嫁金', '子女教育金', '养老金', '自己填写']
			let accountType = this.allInputData.curModuleData.curInsData.accountData.accountPart == 'addAndTake' ? 'add' : this.allInputData.curModuleData.curInsData.accountData.accountPart

			return {
				curModuleData: this.allInputData.curModuleData,
				curInsData: helperJs.deepCopy( {}, this.allInputData.curModuleData.curInsData ),
				age: helperJs.filterArr(this.allInputData.inputData.personData.personOrderList[0].eleOrderList, 'age').value,
				accountType,
				allAddAndTakeData: {},
				popAccountData: {
					gapAge: 1,  //间隔年龄。超始年龄 = age + gapAge
					numMaxlength: 0,
					ageOpts: [],
					benefitAge: 0,
					benefitData: [
						// {
						// 	label: '保费（当年／累积）',
						// 	value: '200000／300000',
						// 	unit: '万',
						// }, {
						// 	label: '领取（当年／累积）',
						// 	value: '200000／3000000',
						// }, {
						// 	label: '账户价值',
						// 	value: '200000',
						// }, {
						// 	label: '账户价值',
						// 	value: '200000',
						// }, {
						// 	label: '账户价值',
						// 	value: '200000',
						// }
					]
				},
				coords: [],  //坐标
				purposeOpts,
				adjustData: {
					purposeType: purposeOpts[purposeOpts.length - 1],
					purpose: '',
					beginYear: 0,
					endYear: 0,
					baof: ''
				},
				rules: {
					required: {
		                rule: true,
		                initial: 'off',
		                message: '请输入值'
		            }
				},
				formEleData: [
					{
						key: 'beginYear',
						componentName: 'cmCommonSelectSever',
						labelName: '开始时间',
						opts: []
					}, {
						key: 'endYear',
						componentName: 'cmCommonSelectSever',
						labelName: '结束时间',
						opts: []
					}, {
						key: 'baof',
						componentName: 'cmCommonInputSever',
						labelName: accountType == 'add' ? '追加金额' : '领取金额',
						placeholder: '请输入金额',
						maxlength: 9,
						inputType: '',
						isDisabled: false,
						rules: {
							required: {
								rule: true,
								initial: 'off',
								message: '请输入值'
							}
						}
					}
				],

				bonusTypeOpts: [],
				bonusType: '',
				allBenefitData: [],
			}
		},
		props: ['allInputData'],
		validator: {
		  // auto: true          // 初始化后自动检查
		},
		created () {
			this.getDefAddAndTakeData()
			this.getAllBenefitData()
			helperJs.stopBodyScroll(true)
		},
		methods: {
			getDefAddAndTakeData () {
				var self = this
				let addAndTakeData = [
					{ key: 'add', adjustData: [] },
					{ key: 'take', adjustData: [] }
				]
				let accountData = self.curInsData.accountData
				accountData.accountPart == 'addAndTake' || (addAndTakeData = accountData.accountPart == 'add' ? [addAndTakeData[0]] : [addAndTakeData[1]])
				accountData.addAndTakeData.length || self.$set(accountData, 'addAndTakeData', addAndTakeData)
			},
			getAllBenefitData (scroll, callBack) {  //scroll是否滚动到指定位置; callBack回调函数
				let self = this
				let productData = helperJs.deepCopy({}, this.curModuleData.curProdData)
				productData.mulInsOrderList.forEach(m => {
					if (m.key == this.curInsData.key) {
						for (let k in this.curInsData) {
							m[k] = this.curInsData[k]
						}
					}
				})
				let curAdjustData = helperJs.filterArr(this.curInsData.accountData.addAndTakeData, this.accountType).adjustData

				let curInsKey
				let eleInsuranceId = helperJs.filterArr(this.curInsData.eleOrderList, 'insuranceId')
				if (this.curInsData.isGroup && eleInsuranceId && helperJs.filterArr(productData.mulInsOrderList, eleInsuranceId.value)) {
					curInsKey = helperJs.filterArr(productData.mulInsOrderList, eleInsuranceId.value).key
				}
				helperJs.vueAxios({  //请求计算
					self,
					url: allApiUrl.getAddAndTake + (curInsKey || this.curInsData.key) + '/' + (this.bonusType || 'low'),
					data: this.$qs.stringify({jd: JSON.stringify({
						insuranceTypeId: planbookId,
						personData: helperJs.convertProductData(this.allInputData).personData,  //转换后的个人信息数据
						productGroupList: [
							{
								key: this.allInputData.popupData.relatedProduct[0],
								prodOrderList: [helperJs.convertProductData(this.allInputData, productData).productData],  //转换后的产品数据
							}
						]
					})})
				}, res => {
					if (res.data.success) {
						if (res.data.data !== -1) {
							self.allAddAndTakeData = res.data.data
							self.allBenefitData = res.data.data.data
							self.bonusTypeOpts = res.data.data.bonus
							self.popAccountData.gapAge = res.data.data.startIndex + 1

							if (self.bonusTypeOpts && !self.bonusType) {
								self.bonusType = self.bonusTypeOpts.opts[0].value
							}
							self.allBenefitData.map(b => {
								self.popAccountData.numMaxlength < b.values.length && (self.popAccountData.numMaxlength = b.values.length)
							})
							self.popAccountData.ageOpts = []
							for (let i = 0; i < self.popAccountData.numMaxlength; i ++) {  //生成年龄选项
								self.popAccountData.ageOpts.push(self.age + i + self.popAccountData.gapAge)
							}

							self.popAccountData.benefitAge || (self.popAccountData.benefitAge = self.popAccountData.ageOpts[0])

							curAdjustData.length && curAdjustData.sort((a, b) => {
								return a[0] - b[0]
							})

							self.adjustData.beginYear = 1
							self.adjustData.endYear = 1
							self.adjustData.baof = ''

							self.adjustData.purposeType = '自己填写'
							self.adjustData.purpose = ''


							self.$nextTick( () => {
								self.getYearOpts()
								self.changeBenifitAge()
							})
							self.$nextTick( () => {
								scroll == 'intoView' && document.querySelector('.changeAccountDataDIv').scrollIntoView()
							})
						}
					} else {
						if (callBack) {
							callBack()
						} else {
							curAdjustData.length && curAdjustData.pop()
						}
					}
				})
			},
			getBonusType (type) {
				var self = this
				self.bonusType = type
				self.getAllBenefitData()
			},
			getAccountType (type) {
				var self = this
				self.accountType = type

				self.adjustData.beginYear = 1
				self.adjustData.endYear = 1
				self.adjustData.baof = ''

				self.getYearOpts()
			},
			getBenefitData () {
				var self = this
				self.popAccountData.benefitData = []
				self.allBenefitData.map(function (b) {
					self.popAccountData.benefitData.push({
						key: b.key,
						value: b.values[self.popAccountData.benefitAge - self.age - self.popAccountData.gapAge],
						label: b.name,
					})
				})
			},
			getYearOpts () {
				let self = this
				let yearOpts = []
				for (let i = 0; i < self.popAccountData.numMaxlength; i ++){
					yearOpts.push({
						val: i + 1,
						desc: '第' + (i + 1) + '年, ' + (i + self.age + self.popAccountData.gapAge) + '岁'
					})
				}

				let curAdjustData = helperJs.filterArr(self.curInsData.accountData.addAndTakeData, self.accountType).adjustData
				let selectedYear = []
				curAdjustData.map(function (a) {
					for (let k = a[0]; k <= a[1]; k ++) {
						selectedYear.push(k + 1)
					}
				})

				helperJs.filterArr(self.formEleData, 'beginYear').opts = yearOpts.filter(function (y) { return selectedYear.indexOf(y.val + 1) === -1 })

				let endYearVal = 0
				curAdjustData.map(function (a) {
					!endYearVal && self.adjustData.beginYear <= a[0] && (endYearVal = a[0])
				})
				endYearVal || (endYearVal = yearOpts[yearOpts.length - 1].val)

				let endYearData = helperJs.filterArr(self.formEleData, 'endYear')
				endYearData.opts = helperJs.filterArr(self.formEleData, 'beginYear').opts.filter(function (y, i, arr) {
					return y.val >= self.adjustData.beginYear && y.val <= endYearVal
				})
				if (endYearData.opts.length && endYearData.opts.every(function (y) {
					return y.val != self.adjustData.endYear
				})) {
					self.adjustData.endYear = endYearData.opts[0].val
				}
			},
			ckAddAndTakeOkFn () {
				var self = this
				helperJs.validateAllFn(0, helperJs.collectValidateVm(self, []), self, function () {
					let curAdjustData = helperJs.filterArr(self.curInsData.accountData.addAndTakeData, self.accountType).adjustData
					if (self.adjustData.beginYear && self.adjustData.endYear) {
						curAdjustData.push([
							self.adjustData.beginYear,
							self.adjustData.endYear,
							self.adjustData.baof
						])
						if (self.adjustData.purposeType != '自己填写' || self.adjustData.purpose) {
							curAdjustData[curAdjustData.length - 1].push(self.adjustData.purposeType != '自己填写' ? self.adjustData.purposeType : self.adjustData.purpose)
						}
						self.getAllBenefitData('intoView')
					}
				}, function($validation){
					self.$toast('请输入正确信息')
					console.log($validation)
				})
			},
			deleteCurAccount (arr, index) {
				var self = this
				self.$nextTick(function () {
					let curAccount = arr.splice(index, 1)
					this.getAllBenefitData('', function () {
						arr.splice(index, 0, curAccount[0])
					})
				})
			},
			deleteAllAccount (type) {
				let self = this
				if (type == 'add') {
					helperJs.filterArr(self.curInsData.accountData.addAndTakeData, type).adjustData = []
					if (helperJs.filterArr(self.curInsData.accountData.addAndTakeData, 'take')) {
						helperJs.filterArr(self.curInsData.accountData.addAndTakeData, 'take').adjustData = []
					}
				} else if (type == 'take') {
					helperJs.filterArr(self.curInsData.accountData.addAndTakeData, type).adjustData = []
				}
				self.getAllBenefitData()
			},
			ckPopupOkFn () {
				for (let k in this.curInsData) {
					this.curModuleData.curInsData[k] = this.curInsData[k]
				}
				this.ckClosePopup()
			},
			ckClosePopup () {
				this.allInputData.popupData.popupName = ''
				helperJs.stopBodyScroll(false)
			},
			startProgress () {
				this.coords = [event.touches[0].screenX, event.touches[0].screenY]
				return false
			},
			ckProgressBar () {
				var self = this
				var downArrowEle =document.getElementById('borderArrowDown')
				var btnEle =document.getElementById('progressMoveBtn')

				const progressBarWidth = document.getElementById('progressBarDiv').offsetWidth - btnEle.getElementsByTagName('i')[0].offsetWidth

				var moveLeft = event.touches[0].clientX - (window.innerWidth - document.getElementById('progressBarDiv').offsetWidth)/2
				moveLeft < 0 && (moveLeft = 0)
				moveLeft > progressBarWidth && (moveLeft = progressBarWidth)

				btnEle.style.left = moveLeft + 'px'
				downArrowEle.style.left = (downArrowEle.offsetParent.offsetWidth) * 0.15 + moveLeft + 'px'
				document.getElementById('progressBarPercent').style.width = moveLeft + 'px'

				self.popAccountData.benefitAge = self.popAccountData.ageOpts[0] + parseInt(moveLeft/progressBarWidth * (self.popAccountData.ageOpts[self.popAccountData.ageOpts.length -1] - self.popAccountData.ageOpts[0]))
				self.getBenefitData()
			},
			moveProgress () {  //拖动进度条
				var self = this
				var downArrowEle =document.getElementById('borderArrowDown')
				var btnEle =document.getElementById('progressMoveBtn')

				const progressBarWidth = document.getElementById('progressBarDiv').offsetWidth - btnEle.getElementsByTagName('i')[0].offsetWidth
				const distance = [event.touches[0].screenX - self.coords[0], event.touches[0].screenY - self.coords[1]]

				var moveLeft = (btnEle.style.left ? parseInt(btnEle.style.left) : 0) + distance[0]
				moveLeft < 0 && (moveLeft = 0)
				moveLeft > progressBarWidth && (moveLeft = progressBarWidth)

				btnEle.style.left = moveLeft + 'px'
				downArrowEle.style.left = (downArrowEle.offsetParent.offsetWidth) * 0.15 + moveLeft + 'px'
				document.getElementById('progressBarPercent').style.width = moveLeft + 'px'

				self.popAccountData.benefitAge = self.popAccountData.ageOpts[0] + parseInt(moveLeft/progressBarWidth * (self.popAccountData.ageOpts[self.popAccountData.ageOpts.length -1] - self.popAccountData.ageOpts[0]))
				self.coords = [event.touches[0].screenX, event.touches[0].screenY]
				self.getBenefitData()
			},
			changeBenifitAge (age) {  //改变利益演示的年龄
				var self = this
				age === undefined || (self.popAccountData.benefitAge = age)
				self.popAccountData.benefitAge < self.popAccountData.ageOpts[0] && (self.popAccountData.benefitAge = self.popAccountData.ageOpts[0])
				self.popAccountData.benefitAge > self.popAccountData.ageOpts[self.popAccountData.ageOpts.length - 1] && (self.popAccountData.benefitAge = self.popAccountData.ageOpts[self.popAccountData.ageOpts.length - 1])
				var downArrowEle =document.getElementById('borderArrowDown')
				var btnEle = document.getElementById('progressMoveBtn')
				const progressBarWidth = document.getElementById('progressBarDiv').offsetWidth - btnEle.getElementsByTagName('i')[0].offsetWidth
				const movePrecent = (self.popAccountData.benefitAge - self.popAccountData.ageOpts[0])/(self.popAccountData.ageOpts[self.popAccountData.ageOpts.length -1] - self.popAccountData.ageOpts[0])

				btnEle.style.left = movePrecent * progressBarWidth + 'px'
				downArrowEle.style.left = (downArrowEle.offsetParent.offsetWidth) * 0.15 + movePrecent * progressBarWidth + 'px'
				document.getElementById('progressBarPercent').style.width = movePrecent * progressBarWidth + 'px'

				self.getBenefitData()
			},
			changeInputData (vmEle) {
				this.changeBenifitAge((this.adjustData.beginYear || 0) + this.age)
				if (vmEle.validate) {
					helperJs.validateAllFn(0, helperJs.collectValidateVm(vmEle, []), vmEle, function () {
					})
				}
			},
			getMinAmount () {
				let rate = this.allAddAndTakeData.rate.opts[0].value + 1
				let accountValue = this.allBenefitData.filter(ele => ele.key === 'account_value')[0]
				let minAmount
				if (this.adjustData.beginYear && this.adjustData.endYear && accountValue && accountValue.values && rate) {
					for (let k = this.adjustData.beginYear; k <= this.adjustData.endYear; k ++) {
						let curValue = (accountValue.values[k - 1] * (1 - rate) / (1 - Math.pow(rate, k - this.adjustData.beginYear + 1))) / rate
						minAmount = minAmount ? Math.min(minAmount, curValue) : curValue
					}
				}

				if (this.adjustData.beginYear && this.adjustData.endYear && this.adjustData.endYear <= this.popAccountData.ageOpts.length) {
					for (let i = this.adjustData.endYear + 1; i <= this.popAccountData.ageOpts.length; i++) {
						minAmount = Math.min(minAmount, accountValue.values[i - 1] / (this.adjustData.endYear - this.adjustData.beginYear + 1) / Math.pow(rate, i - (this.adjustData.beginYear + this.adjustData.endYear - 1) / 2))
					}
				}

				let precision = Math.max(Math.pow(10,Math.floor(Math.log(minAmount)/Math.log(10)-2)), 100)
				return minAmount ? Math.floor(minAmount / precision) * precision : 0
			}

		},
		watch: {
			'adjustData.beginYear' () {
				this.getYearOpts()
			},
			'accountType' () {
				var self = this
				self.formEleData.map(function (e) {
					if (e.key === 'baof') {
						e.labelName = self.accountType == 'add' ? '追加金额' : '领取金额'
					}
				})
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
			& .showAccountDataDIv {
				position: relative;
				width: 94%;
				margin: 24px auto 0;
				padding: 30px;
				font-size: 26px;
				color: var(--gray_666);
				background: #fff;
				border-radius: 4px;
				& header {
					position: relative;
					padding: 0 0 32px;
					text-align: center;
					font-size: 32px;
					& i {
						position: absolute;
						top: -8px;
						right: -3%;
						padding: 0 2%;
						font-size: 40px;
						color: var(--gray_999);
						vertical-align: top;
					}
				}
				& .bonusTypeUl {
					display: flex;
					width: 100%;
					padding: 30px 0;
					& li {
						position: relative;
						flex: 1;
						padding-right: 16px;
						& select {
							width: 100%;
							line-height: normal;
						}
						& i {
							position: absolute;
							top: 50%;
							right: 30px;
							transform: translateY(-50%);
							font-size: 24px;
							color: var(--gray_ccc);
						}
						&:last-child {
							padding-right: 0;
						}
					}
				}
				& .accountDataDIv {
					position: relative;
					padding: 24px;
					border: 1px solid var(--mainColor_blue);
					border-radius: 4px;
					text-align: center;
					& .selectAgeDiv {
						display: inline-block;
						position: relative;
						margin-top: 16px;
						& select {
							height: 60px;
							line-height: 60px;
							padding-right: 40px;
							font-size: 30px;
						    & em.upArrowIcon.disabled {
						      border-bottom-color: #ccc;
						      border-right-color: #ccc;
						    }
						}
					}
					& ul {
						margin-top: 30px;
						text-align: left;
						font-size: 30px;
						& li {
							padding: 16px 0;
							vertical-align: middle;
							white-space: nowrap;
							overflow: hidden;
							text-overflow: ellipsis;
							& label {
								display: inline-block;
								width: 40%;
								@mixin nowrap;
								vertical-align: middle;
							}
							& span {
								width: 50%;
								margin-left: 8px;
								color: var(--mainColor_blue);
								vertical-align: middle;
							}
						}
					}
					& em.borderArrowDown {
						position: absolute;
						left: 15%;
						bottom: -9px;
						display: inline-block;
						width: 16px;
						height: 16px;
						margin: 0 1px;
						border-right: 1px solid var(--mainColor_blue);
						border-bottom: 1px solid var(--mainColor_blue);
						transform: rotate(45deg);
						background: #fff;
					}
				}
				& .changeAgeBar {
					position: relative;
					margin-top: 56px;
					text-align: center;
					& i {
						@mixin fontIconCenter;
						font-size: 40px;
						color: var(--mainColor_blue);
						font-weight: bold;
						z-index: 100;
						&.icon-reduce {
							right: unset;
							left: 16px;
						}
						&.icon-add {
							right: 16px;
						}
					}
					& .progressBarDiv {
						position: relative;
						display: inline-block;
						width: 70%;
						height: 16px;
						margin: 8px 0 8px 0;
						background: var(--gray_e5);
						vertical-align: middle;
						border-radius: 32px;
						& span {
							position: absolute;
							top: 0;
							left: 0;
							display: inline-block;
							width: 0;
							height: 100%;
							background: var(--mainColor_blue);
							border-top-left-radius: 32px;
							border-bottom-left-radius: 32px;
						}
						& em {
							position: absolute;
							top: 50%;
							left: 0;
							display: inline-block;
							width: 30px;
							height: 30px;
							margin-top: -15px;
							margin-left: -4px;
							background: rgba(117, 161, 255, 0.2);
							border-radius: 2rem;
							box-sizing: content-box;
							& i {
								position: absolute;
								top: 50%;
								left: 50%;
								display: inline-block;
								width: 22px;
								height: 22px;
								margin-top: -11px;
								margin-left: -11px;
								background: var(--mainColor_blue);
								border-radius: 2rem;
								pointer-events: none;
							}
						}
					}
				}
			}
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
				& .AddAndTakeOkBtnDiv {
					border: 1px solid var(--gray_e5);
					border-top: none;
					height: 84px;
					line-height: 84px;
					text-align: center;
					color: var(--mainColor_blue);
					vertical-align: middle;
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
						& p {
							color: var(--gray_ccc);
							font-size: 26px;
							line-height: 145%;
							border: none;
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
				& table {
					width: 100%;
					border-collapse: collapse;
					&:first-child {
						margin-top: 32px;
						& caption {
							border-top: 1px solid var(--gray_e5);
						}
					}
					& caption {
						position: relative;
						padding: 24px 16px 20px;
						text-align: left;
						border: 1px solid var(--gray_e5);
						border-top: none;
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
					& tbody {
						& tr {
							display: table-row;
							& td {
								position: relative;
								border-bottom: 1px solid var(--gray_e5);
								border-left: 1px solid var(--gray_e5);
								padding: 0;
								text-align: left;
								min-width: 48px;
								color: var(--gray_999);
								vertical-align: middle;
								padding: 20px 16px 16px;
								&:first-child {
									width: 40%;
								}
								&:last-child {
									border-right: 1px solid var(--gray_e5);
								}
								& i {
									@mixin fontIconCenter;
									padding: 8px;
									color: var(--gray_999);
									right: 16px;
									margin-top: -22px;
								}
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
				}
			}
		}
	}
</style>
