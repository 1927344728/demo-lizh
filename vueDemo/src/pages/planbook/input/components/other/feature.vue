<template>
	<div class="otherFeatureDiv" v-if="isLoaded">
		<ul>
			<li v-for="(fea, idx) in featureData" @click="fea.goTo()" class="noDisabled" :data-stat-id="fea.jdk" v-if="!fea.hide">
				<span><i class="iconfont" :class="fea.icon"></i></span>
				<p>{{fea.label}}</p>
			</li>
		</ul>
	</div>
</template>

<script>
	import helperJs from '@/utils/helper'
	import {
	    baseApiPath,
	    planbookId,
	    resultUuid

	} from '@/utils/index'
	export default {
		name: 'OtherFeature',
		data () {
			return {
				isLoaded: false,
				featureData: [
					{
						icon: 'icon-grab_class',
						label: '投保规则',
						jdk: 'TBGZ',
						goTo: this.goToRules,
						hide: !this.planbookData.commonData.insurancesRules
					}, {
						icon: 'icon-weekly',
						label: '产品条款',
						jdk: 'CPTK',
						goTo: this.goToTerms,
					}, {
						icon: 'icon-handbook',
						label: '产品资料',
						jdk: 'cpzl',
						goTo: this.goToProductNews,
					}, {
						icon: 'icon-vs',
						label: '产品对比',
						jdk: 'dban',
						goTo: this.goToPbCompare,
					}, {
						icon: 'icon-home_line',
						label: '家庭计划书',
						jdk: 'JTJHS_AN',
						goTo: this.goToFamilyPlan,
					}, {
						icon: 'icon-term',
						label: '保单年检',
						jdk: 'JTJHS_nj',
						goTo: this.goToAnnualSurvey,
						hide: true
					}
				]
			}
		},
		props: ['planbookData'],
		created () {
			if (this.planbookData.companyId == 1) {
				this.hasSales()
			} else {
				this.isLoaded = true
			}
		},
		methods: {
			hasSales () {
				let self = this
			    helperJs.vueAxios({
			        self,
			        url: `${baseApiPath}/planBook/V2/hasSales`,
			        type: 'get'
			    }, res => {
			        if (res.data.success) {
			            self.featureData[5].hide = !res.data.data
			        }
			        self.isLoaded = true
			    })
			},
			goToRules () {
				location.href = `${globalHostName}/planBook/industryTools/planRelated/insuranceRules.html?typeId=${planbookId}`
			},
			goToTerms () {
				location.href = `${globalHostName}/planBook/termsSearch/pages/planBookTerms.html?nw=1&typeId=${planbookId}`
			},
			goToProductNews () {
				let url = (this.planbookData.commonData && this.planbookData.commonData.featureUrl) ? this.planbookData.commonData.featureUrl : `${globalHostName}/planBook/projectGroup/productNews2/index.html?nw=1&planbookId=${planbookId}`
				if (location.hostname.search(/localhost|192\.168\./) !== -1) {
					url = location.protocol + '//' + location.hostname + `:9200/productNews2/index.html?nw=1&planbookId=${planbookId}`
				}
				location.href = url
			},
			goToPbCompare () {
				var self = this
				helperJs.makePlanbook({
				    self,
				    successFn: function (res) {
						let personOrderList = helperJs.isObjExist(self.inputData, ['personData', 'personOrderList'])
						let person = []
						if (personOrderList) {
							personOrderList.map(function (per, pi){
								if (pi < 2) {
									person[pi] = {}
									per.eleOrderList.map(function (ele) {
										if (['sex', 'age'].indexOf(ele.key) !== -1) {
											person[pi][ele.key] = ele.value
										}
									})
								}
							})
						}

						let url = `${globalHostName}/planBook/planbookInput/pages/other/multPBCompare/multPBCompare.html?person=${encodeURIComponent(JSON.stringify(person))}&multUuid=${encodeURIComponent(JSON.stringify([res.data.data]))}`
						if (location.hostname.search(/localhost|192\.168\./) !== -1) {
							url = `${globalHostName}/other/multPBCompare/multPBCompare.html?person=${encodeURIComponent(JSON.stringify(person))}&multUuid=${encodeURIComponent(JSON.stringify([res.data.data]))}`
						}
						location.href = url
				    }
				})
			},
			goToFamilyPlan () {
				var self = this
				var allMainInsData = self.inputData.productGroupList[0]
				if (allMainInsData.prodOrderList.some(function (ele) {
				    return !!ele.hadChoice && !ele.hide
				})) {
					helperJs.makePlanbook({
					    self,
					    successFn: function (res) {
							location.href = `../familyV3/familyV3.html?resultUuid=${res.data.data}`
					    }
					})
				} else {
					location.href = `../familyV3/familyV3.html`
				}
			},
			goToAnnualSurvey () {
				let url = `${globalHostName}/planBook/projectGroup/annualSurvey/index.html`
				if (location.hostname.search(/localhost|192\.168\./) !== -1) {
					url = `${location.protocol}//${location.hostname}:9200/annualSurvey/index.html`
				}
				location.href = url
			}
		},
		computed: {
			totalBaof: function () {
				let totalBaof = 0  //所有产品的保费和
				this.inputData.productGroupList.map(function (group) {
					if (!group.isHide) {
						group.prodOrderList.map(function(prod){
							if (prod.hadChoice && !prod.hide) {
								totalBaof += prod.totalBaof * 1 || 0
							}
						})
					}
				});
				return totalBaof.toFixed(2)
			}
		}
	}
</script>

<style scoped>
	@import 'variables.css';
	.otherFeatureDiv {
		margin-top: 18px;
		padding: 36px 0;
		background: #fff;
		border-radius: 8px;
		& ul {
			display: flex;
			& li {
				flex: 1;
				text-align: center;
				& span {
					position: relative;
					display: inline-block;
					width: 80px;
					height: 80px;
					color: var(--mainColor_blue);
					border: 1px solid var(--mainColor_blue);
					border-radius: 80px;
					pointer-events: none;
					& i {
						position: absolute;
						top: 50%;
						left: 50%;
						transform: translateX(-50%) translateY(-50%);
						font-size: 48px;
					}
					pointer-events: none;
				}
				& p {
					font-size: 24px;
					pointer-events: none;
				}
			}
		}
	}

</style>

