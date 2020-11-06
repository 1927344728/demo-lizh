<template>
	<div class="accountAddAndTakeDiv">
		<table>
			<caption position="top" class="clearFloat">
				<h5 class="atTitleH5">{{insData.name}}</h5>
				<div class="addAndTakeBtn">
					<span @click="gotoAdjustBaof">调整保额 <i class="iconfont icon-more_circle"></i></span>
				</div>
			</caption>
			<thead v-if="prodData.adjustBaoeData && prodData.adjustBaoeData.length">
				<tr>
					<td v-for="(value, key, vIdx) in prodData.adjustBaoeData[0]" :key="key">
						{{getAdjustBaoeInsTitle(prodData.mulInsOrderList, key)}}
					</td>
				</tr>
			</thead>
			<tbody v-if="prodData.adjustBaoeData && prodData.adjustBaoeData.length" @click="gotoAdjustBaof">
				<tr v-for="(adjust, idx) in prodData.adjustBaoeData" :key="JSON.stringify(adjust)" class="list-item">
					<td v-for="(value, key, vIdx) in adjust" :key="key">
						{{value}}
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
	export default {
		name: 'InsuranceAdjustBaoe',
		data () {
			return {
			}
		},
		props: ['allInputData', 'groupData', 'prodData', 'insData'],
		methods: {
			gotoAdjustBaof () {
				let self = this
				let popupData = self.allInputData.popupData
				self.$set(popupData, 'relatedProduct',[self.groupData.key, self.prodData.key])
				self.$set(self.allInputData, 'curModuleData', {
					curProdData: self.prodData,
					curInsData: self.insData,
				})
				self.allInputData.popupData.popupName = 'PopupAdjustBaoe'
			},
			getAdjustBaoeInsTitle (mulInsOrderList, key) {
				let insData = mulInsOrderList.filter(function (ins, i) {
					return ins[ins.code ? 'code' : 'key'] == key.replace(/baoe_/, '')
				})[0]
				return key === 'age' ? "年龄" : (/(\(|\（)([^\(\（]+)(\)|\）)$/.exec(insData.name) ? /(\(|\（)([^\(\（]+)(\)|\）)$/.exec(insData.name)[2] : insData.name)
			}
		}
	}
</script>

<style scoped>
	@import 'variables.css';
	.accountAddAndTakeDiv {
		margin: 18px 0 18px 4%;
		padding-right: 4%;
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
					font-size: 28px;
					text-align: left;
					@mixin nowrap;
				}
				& span {
					color: var(--mainColor_blue);
					@mixin fontIconCenter;
					right: 16px;
				}
			}
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
							width: 40%;
							text-align: center;
						}
						&:last-child {
							border-right: 1px solid var(--gray_e5);
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
</style>
