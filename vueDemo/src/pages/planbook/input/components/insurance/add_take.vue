<template>
	<div class="accountAddAndTakeDiv">
		<table>
			<caption position="top" class="clearFloat">
				<h5 class="atTitleH5">{{insData.accountData.accountName || insData.name}}</h5>
				<div class="addAndTakeBtn">
					<span @click="gotoAdjustBaof">{{insData.accountData.accountPart === 'addAndTake' ? '追加领取' : insData.accountData.accountPart === 'add' ? '追加保费' : '部分领取'}} <i class="iconfont icon-more_circle"></i></span>
				</div>
			</caption>
			<tbody v-if="insData.accountData.addAndTakeData" @click="gotoAdjustBaof">
				<tr v-for="account in insData.accountData.addAndTakeData" v-if="account.adjustData && account.adjustData.length">
					<td style="text-align: center;">{{account.key == 'add' ? '追加' : '领取' }}</td>
					<td class="clearFloat">
						<ul v-if="account.adjustData">
							<li v-for="(at, idx) in account.adjustData"> 第{{at[0]}}年-第{{at[1]}}年  {{at[2]}} </li>
						</ul>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
	export default {
		name: 'InsuranceAddTake',
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
				self.allInputData.popupData.popupName = 'PopupAddTake'
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
			& caption {
				line-height: normal;
				padding: 18px;
				border: 1px solid var(--gray_e5);
				text-align: left;
				& h5 {
					width: 65%;
					display: inline-block;
					vertical-align: middle;
					font-size: 28px;
					@mixin nowrap;
				}
				& .addAndTakeBtn {
					float: right;
					display: inline-block;
					vertical-align: middle;
					color: #508CEE;
					& span {
						margin-left: 32px;
						& i {
							vertical-align: -1px;
						}
					}
				}
			}
			& tbody {
				& tr {
					& td {
						border-bottom: 1px solid var(--gray_e5);
						border-left: 1px solid var(--gray_e5);
						padding: 0;
						text-align: left;
						min-width: 48px;
						color: var(--gray_999);
						vertical-align: middle;
						&:first-child {
							padding: 14px 16px 10px;
							width: 80px;
						}
						&:last-child {
							border-right: 1px solid var(--gray_e5);
						}
						& ul {
							width: 100%;
							& li {
								position: relative;
								padding: 14px 16px 10px;
								border-bottom: 1px solid var(--gray_e5);
								&:last-child {
									border-bottom: none;
								}
								& i {
									position: absolute;
									top: 50%;
									right: 0;
									margin-top: -28px;
									padding: 12px;
								}
							}
						}
					}
				}
			}
		}
	}
</style>
