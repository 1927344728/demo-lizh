<template>
	<div class="insureInfoDiv">
		<!-- 关于人的信息 如姓名、性别、年龄 -->
		<ul>
			<li v-for="(ele, i) in personData.eleOrderList" v-if="title || ele.key=='title'">
				<component
					v-if="!ele.isHide"
					:is="ele.componentName || 'cmInfo' + ele.key.replace(/\b(\w)|\s(\w)/g, function(m){return m.toUpperCase()})"
					:all-input-data="allInputData"
					:person-data="personData"
					:element-ui-info="ele"
					@relatePersonInfo="relatePersonInfo"
				></component>
			</li>
			<li v-if="!pBType && personData.key === 'recipientInfo' && title" data-stat-id="fm">
				<div class="posRelative clearFloat">
				  <label class="pInfoLabel">封面样式</label>
				  <div class="inlineBlock floatRight chooseCover" @click="chooseCover">
				    <span>
				    	{{personData.coverName || '请选择封面'}}
				    	<i class="iconfont icon-arrow_down"></i>
				    </span>
				  </div>
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
import helperJs from '@/utils/helper'
import {
    pBType
} from '@/utils/index'

import cmInfoTitle from '../atomComponentsv2/person_info_title.vue'
import cmInfoRadio from '../atomComponentsv2/person_info_radio.vue'
import cmInfoName from '../atomComponentsv2/person_info_name.vue'
import cmInfoSex from '../atomComponentsv2/person_info_sex.vue'
import cmInfoAge from '../atomComponentsv2/person_info_age.vue'
import cmInfoBirthday from '../atomComponentsv2/person_info_birthday.vue'

import cmInfoInsuranceDay from '../atomComponentsv2/person_info_insuranceDay.vue'
import cmInfoMemberId from '../atomComponentsv2/person_info_memberId.vue'
export default {
	name: 'cmInsureInfo',
	data () {
		return {
			pBType
		}
	},
	props: ['allInputData', 'personData'],
	created () {
		this.relatePersonInfo(1)
	},
	methods: {
		relatePersonInfo (type) {
			let self = this
			if (self.personData.key !== 'recipientInfo') {
				helperJs.getDefaultAge(self.personData)  //被保人的年龄不在范围内，默认取范围内的最小年龄

				let personOrderList = self.allInputData && self.allInputData.inputData.personData.personOrderList
				let personData = personOrderList && helperJs.filterArr(personOrderList, self.personData.key)

				if (personData) {
					let personInsured = personOrderList && helperJs.filterArr(personOrderList, 'insuredInfo')
					let personApplicant = personOrderList && helperJs.filterArr(personOrderList, 'applicantInfo')
					if (personData.key === 'insuredInfo' && personApplicant) {  //关于被保人、投保人是否是同一人的处理
					  	let personInsuredAge = helperJs.filterArr(personData.eleOrderList, 'age')

						//被保人所选年龄不在投保人年龄范围内，强制选中投保人。即被保人年龄不能做投保人
					  	let personApplicantAge = helperJs.filterArr(personApplicant.eleOrderList, 'age')
					  	let personApplicantTitle = helperJs.filterArr(personApplicant.eleOrderList, 'title')
					  	let personApplicantSame = helperJs.filterArr(personApplicant.eleOrderList, 'applicantAndInsuredSame')
						if (personInsuredAge.value >= personApplicantAge.opts[0] && personInsuredAge.value <= personApplicantAge.opts[1]) {
							self.$set(personApplicantTitle, 'isDisabled', false)
							personApplicantSame && self.$set(personApplicantSame, 'isDisabled', false)
							personApplicantSame && self.$set(personApplicantSame, 'isHide', false)
						} else {
							personData.eleOrderList.map(function (ele) {
								if (ele.key == 'title') {
									self.$set(personApplicantTitle, 'value', true)
									self.$set(personApplicantTitle, 'isDisabled', true)
								}
							})
							if (personApplicantSame) {
								self.$set(personApplicantSame, 'value', 0)
								self.$set(personApplicantSame, 'isDisabled', true)
								self.$set(personApplicantSame, 'isHide', true)
							}
						}
						helperJs.getDefaultAge(personApplicant)  //设置投保人年龄默认值

					}
					/**
					 * @Author   Lizh
					 * @DateTime 2019-07-01
					 */
					if (personApplicant) {
						let personApplicantSame = helperJs.filterArr(personApplicant.eleOrderList, 'applicantAndInsuredSame')
						personApplicantSame && personApplicant.eleOrderList.map(ele => {
							if (ele.key !== 'title' && ele.key !== 'applicantAndInsuredSame') {
								self.$set(ele, 'isHide', personApplicantSame.value === 1)
								if(personApplicantSame.value) {
									let insuredEle = helperJs.getArraySubEle(personInsured.eleOrderList, 'key', ele.key)
									insuredEle && (ele.value = insuredEle.value)
								}
							}
						})
					}

					if (personApplicant) {  //选中投保人才能选投保人配偶
						var spouseInfo = helperJs.filterArr(personOrderList, 'spouseInfo')
						if (spouseInfo) {
							if (helperJs.filterArr(personApplicant.eleOrderList, 'title').value) {
								helperJs.filterArr(spouseInfo.eleOrderList, 'title').isDisabled = false
							} else {
								helperJs.filterArr(spouseInfo.eleOrderList, 'title').isDisabled = true
								helperJs.filterArr(spouseInfo.eleOrderList, 'title').value = false
							}
							helperJs.filterArr(spouseInfo.eleOrderList, 'sex').value = helperJs.filterArr(personApplicant.eleOrderList, 'sex').value == 1 ? 2: 1
						}
						helperJs.getDefaultAge(personApplicant)  //设置投保人年龄默认值
					}
				}
				type == 1 || helperJs.changePersonInfo(self)
				let btnSetEle = document.getElementsByClassName('insBtnSetDiv')[0]
                btnSetEle && btnSetEle.classList.remove('positionToBtn')
			}
		},
		chooseCover () {
			helperJs.stopBodyScroll(true)
		    this.allInputData.popupData.popupName = 'PopupResultCover'
		}
	},
	computed: {
		title () {
			return this.personData.eleOrderList.filter(function (ele) { return ele.key == "title"})[0].value
		}
	},
	components: {
		cmInfoTitle,
		cmInfoRadio,
		cmInfoName,
		cmInfoSex,
		cmInfoAge,
		cmInfoBirthday,

		cmInfoInsuranceDay,
		cmInfoMemberId,
	}
}
</script>

<style scoped>
	@import 'variables.css';
	.insureInfoDiv {
		margin: 12px 0;
		padding: 0 30px;
		& ul {
			& li {
				line-height: 84px;
				font-size: 0;
				& > div {
					font-size: 0;
					vertical-align: top;
				}
				&:first-child {
					line-height: 80px;
				}
				& .chooseCover {
					font-size: 26px;
					& span {
						display: inline-block;
						width: 252px;
						height: 54px;
						line-height: 54px;
						padding: 0 20px 0 12px;
						border: 1px solid var(--gray_e5);
						border-radius: 4px;
						& .icon-arrow_down {
						  position: absolute;
						  top: 50%;
						  right: 18px;
						  transform: translateY(-50%) scale(0.75);
						  font-size: 24px;
						}
					}
				}
			}
		}
	}
</style>
