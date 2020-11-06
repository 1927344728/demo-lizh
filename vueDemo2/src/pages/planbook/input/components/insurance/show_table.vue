<template>
	<div class="insTableDiv" :product-code="productData.key">
		<!-- 展示主险或附加险已选险种的数据 -->
		<div class="insTitleDiv">
			<h4>
				<span :style="{
					maxWidth: (pBType == 'multCompare' && productData.trade) ? '45%' : '60%'
				}">{{productData.titleName}}</span>
				<em class="tradeOnline" v-if="pBType == 'multCompare' && productData.trade">线上投保</em>
				<h5 v-if="!!productData.hadChoice">首年保费：{{(productData.totalBaof * 1).toFixed(2)}}</h5>
				<h5 v-if="pBType =='multCompare'">{{productData.companyName}}</h5>
				<p class="btnBoxP">
					<em data-stat-id="XZXZ_SC" @click="ckDeleteFn" v-if="showDeleteBtn">{{productData.btnName && productData.btnName.split(',')[0] || '删除'}}</em>
					<b v-if="showDeleteBtn">|</b>
					<em :class="selectedProductNum >= maxNum && !productData.hadChoice ? 'disabled' : ''" data-stat-id="XZXZ_BJ" @click="ckModifyFn">{{modifyBtnName}}</em>
				</p>
			</h4>
		</div>

		<table class="insShowTable" v-if="productData.insShowArr && productData.insShowArr.length" @click="ckModifyFn">
			<tr v-for="(oneTr, oneIdx) in productData.insShowArr">
				<!-- <td v-for="(td, index) in oneTr" :style="( (oneIdx!=0) && (index==0))?'text-align: justify':( isNaN(Number(td)) )?'':'text-align: right;'">{{td}}</td> -->
				<td v-for="(td, index) in oneTr">{{td}}</td>
			</tr>
		</table>
	</div>
</template>

<script>
	import {
	    pBType
	} from '@/utils/index'
	export default {
		name: 'ShowTable',
		data () {
			let self = this
			let productIdx
			self.groupData.prodOrderList.map(function (prod, i) {
				if (prod.key == self.productData.key) {
					productIdx = i
				}
			})

			return {
				productIdx,
				maxNum: 10,
				pBType
			}
		},
		props: ['allInputData', 'groupData', 'productData', 'productName'],
		methods: {
			ckModifyFn () {
				var self = this
				if (self.selectedProductNum >= self.maxNum && !self.productData.hadChoice) {
					self.$toast(`最多选择${self.maxNum}款产品`)
				} else {
					self.popupData.relatedProduct = self.productName
					self.popupData.popupName = self.productData.componentName || 'PopupInsuranceChoose'
				}
			},
			ckDeleteFn (type) {
				var self = this
				self.$delete(self.productData, 'insShowArr')
				self.$delete(self.productData, 'hadChoice')
				self.$emit("showAddiIns")
			}
		},
		computed: {
			popupData () {
			    return this.$store.getters.PopupData
			},
			selectedProductNum () {
				return this.groupData.prodOrderList.filter( function (prod) { return !prod.hide && !!prod.hadChoice }).length
			},
			showDeleteBtn () {
				let bShow
				if (pBType == 'multCompare') {
					bShow = !!this.productData.hadChoice
				} else {
					bShow = (!!this.productData.hadChoice && !this.productData.required) || (this.productIdx >= this.groupData.defNum)
				}
				return bShow
			},
			modifyBtnName () {
				let btnName
				if (pBType == 'multCompare') {
					btnName = this.productData.hadChoice ? '修改' : '添加'
				} else {
					btnName = this.productData.btnName && this.productData.btnName.split(',')[1] || '修改'
				}
				return btnName
			}
		}
	}
</script>

<style scoped>
	@import 'variables.css';
	.insTableDiv {
		margin-left: 4%;
		padding-right: 4%;
		&:last-child {
			border-bottom: none;
		}
	}
	.insTitleDiv {
		& h4 {
			position: relative;
			padding: 30px 0;
			font-weight: bold;
			color: #333;
			& span {
				display: block;
				max-width: 60%;
				line-height: 24px;
				font-size: 30px;
				@mixin nowrap;
			}
			& em.tradeOnline {
				display: inline-block;
				padding: 0 0.25rem;
				margin-left: 10px;
				border: 1px solid #FF703E;
				line-height: normal;
				color: #FF703E;
				font-size: 24px;
				border-radius: 4px;
				vertical-align: middle;
			}
			& h5 {
				display: block;
				width: 100%;
				line-height: 24px;
				color: var(--gray_666);
				font-size: 28px;
				font-weight: normal;
				@mixin nowrap;
			}
			& p.btnBoxP {
				position: absolute;
				top: 30px;
				right: -28px;
				display: inline-block;
				color: var(--gray_e5);
				& em {
					display: inline-block;
					padding: 8px 28px;
					line-height: 1rem;
					color: var(--mainColor_blue);
					border-radius: 4px;
					font-weight: normal;
					vertical-align: middle;
					text-align: center;
				}
				& b {
					font-weight: normal;
				}
			}
		}
	}
	.insShowTable {
		width: 100%;
		margin: 0 auto 18px;
		color: var(--gray_999);
		border-collapse: collapse;
		& tr {
			& td {
				border-top: 1px solid var(--gray_e5);
				border-left: 1px solid var(--gray_e5);
				padding: 14px 16px 10px;
				text-align: center;
				min-width: 48px;
			}
			& td:first-child {
				text-align: justify;
				width: 7rem;
			}
			& td:last-child {
				width: 4.8rem;
				border-right: 1px solid var(--gray_e5);
			}
			&:first-child td {
				text-align: center;
			}
			&:last-child td {
				border-bottom: 1px solid var(--gray_e5);
			}
		}
	}
</style>
