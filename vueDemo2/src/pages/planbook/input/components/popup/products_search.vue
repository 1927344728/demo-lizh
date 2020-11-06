<template>
	<div class="products_search">
		<div class="products_search_body" :style="{
			'padding-top': searchFixedHeight + 'px'
		}">
			<div class="products_search_fixed">
				<header class="search_title">
				    <span>产品搜索</span>
				    <i class="iconfont icon-close_line" @click="ckCloseBtn"></i>
				</header>
				<header class="search_wrapper clearFloat">
					<form class="search_input_wrapper" action="#" @submit.prevent="searchTempProducts()">
						<p class="search_bar">
							<i class="iconfont icon-search"></i>
							<input class="products_search_input" type="text" v-model="keyword" placeholder="搜索产品" @keyup.enter="searchTempProducts()">
							<i class="iconfont icon-close_circle_surface" v-if="keyword" @click="clearKeyword"></i>
						</p>
						<span class="search_btn floatRight" @click="ckCancel">取消</span>
					</form>
					<div class="search_tips" v-if="filterSearchResultList.length">
					    <i class="iconfont icon-help"></i>已为您挑选出“{{insuredInfo.sex === 1 ? '男' : '女'}} {{insuredInfo.age}}岁”可投保产品
					</div>
				</header>
			</div>

			<div class="search_history_type" v-if="!finishSearch && searchRecord.length">
				<dl class="search_history_dl">
					<dt>历史记录</dt>
					<dd v-for="(record, idx) in searchRecord" @click="keyword = record, searchTempProducts()">
						{{record}}
					</dd>
				</dl>
				<p class="clear_search_icon" v-if="searchRecord && searchRecord.length" @click="clearAllRecordKeys">清除搜索记录</p>
			</div>
			<div class="search_result" v-show="finishSearch"
				:style="{
					height: searchScrollHeight + 'px'
				}"
			>
				<div>
					<bxs-default-page
						v-show="!searchResultList.length"
						text="抱歉，没有搜到相关产品"
						label="向我们反馈"
						type="search"
						style="padding-top: 5.5rem;"
						@action="gotoFeedback"
					></bxs-default-page>
					<bxs-default-page
						v-show="searchResultList.length && !filterSearchResultList.length"
						:text="`没有“${insuredInfo.sex === 1 ? '男' : '女'}${insuredInfo.age}岁”可投保产品`"
						type="search"
						style="padding-top: 3rem"
					></bxs-default-page>
					<div v-show="searchResultList.length">
						<header class="search_result_title" v-show="searchResultList.length && !filterSearchResultList.length">
							<i class="iconfont icon-help"></i>
							找到其他搜索结果{{getResultNum(searchResultList)}}项
						</header>
						<dl class="searchResultDl" v-for="comp in (filterSearchResultList.length ? filterSearchResultList : searchResultList)" :key="comp.companyId">
							<dt>{{comp.name}}</dt>
							<dd v-for="prod in comp.productList" :Key="prod.key" @click="goToNext(prod)">
								<p class="product_name">
									<span v-html="prod.titleName"></span>
									<i class="iconfont icon-arrows_right" v-if="!prod.filterFlag"></i>
								</p>
								<ul class="insurance_list" v-if="prod.insuranceList && prod.insuranceList.length">
									<li v-for="ins in prod.insuranceList" :key="ins.id" v-html="(ins.code ? '(' + ins.code + ')  ' : '') + ins.name"></li>
								</ul>
							</dd>
						</dl>
						<div class="no_more_result" v-if="productCount > 8"><span>没有更多了</span></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import helperJs from '@/utils/helper'
	import {
	    baseApiPath,
	    planbookId
	} from '@/utils/index'
	import BScroll from 'better-scroll'
	export default {
		data () {
			let storageKey = `searchTempProds`
			return {
				inputData: this.allInputData.inputData,
				keyword: '',
				finishSearch: false,
				storageKey,
				searchRecord: JSON.parse(localStorage.getItem(storageKey)) || [],
				searchResultList: [],
				productCount: 0,
				windowHeight: window.innerHeight * 0.9,
				searchFixedHeight: 0,
				searchScrollHeight: 0,
				BScrollSearchResult: null,
				window
			}
		},
		props: {
		    allInputData: {
		        type: Object,
		        default () {
		            return {}
		        }
		    },
		    groupTypeOpts: Array
		},
		mounted () {
		    // document.body.addEventListener('touchmove', function () {
		    // })
		    this.getSearchFixedHeight()
		},
		methods: {
			getSearchFixedHeight() {
				this.$nextTick(() => {
					this.searchFixedHeight = document.getElementsByClassName('products_search_fixed')[0].clientHeight
				})
				this.$nextTick(() => {
					this.searchScrollHeight = Math.max(window.innerHeight * 0.9, this.windowHeight) - this.searchFixedHeight
					if (this.BScrollSearchResult) {
						this.BScrollSearchResult.refresh()
					}
					if (!this.BScrollSearchResult && this.searchResultList && this.searchResultList.length) {
					    this.BScrollSearchResult = new BScroll('.search_result', {
					    	scrollY: true,
					        click: true
					    })
					}
				})
			},
			searchTempProducts () {
				let self = this
				self.keyword = self.keyword.trim()
				if (self.keyword) {
					let insuredInfo = helperJs.convertProductData({inputData: this.inputData}).personData.personOrderList[0]  //被保人的信息
					let tagId = this.groupTypeOpts ? this.groupTypeOpts.filter(opt => opt.id === planbookId)[0].tagId : null
					helperJs.vueAxios({
						self: self,
						type: 'post',
						url: `${baseApiPath}/planBook/productTemp/searchProduct`,
						data: {
							keyword: this.keyword,
							age: insuredInfo.age,
							sex: insuredInfo.sex,
							// companyId: 1,
							// tagId
						}
					}, res => {
						if (res.data.success) {
							self.searchResultList = res.data.data || []
							self.setSearchRecord(self.keyword)
						}
						document.getElementsByClassName('products_search_input')[0].blur()
					})
				} else {
					self.$toast('请输入产品关键字')
				}
			},
			clearKeyword() {
				this.keyword = ''
				this.searchResultList = []
				document.getElementsByClassName('products_search_input')[0].focus()
			},
			setSearchRecord (keyword) {
				this.finishSearch = true
				if (this.searchRecord.indexOf(keyword) !== -1) {
					let index = this.searchRecord.findIndex(ele => ele === keyword)
					this.searchRecord.splice(index, 1)
				}
				this.searchRecord.splice(0, 0, keyword)
				this.searchRecord.length > 6 && (this.searchRecord.pop())
			},
			goToNext (opt) {
				if (opt.filterFlag) {
					return
				}
				let prodData = this.inputData.productGroupList[0].prodOrderList[0]
				this.allInputData.popupData.relatedProduct = [this.inputData.productGroupList[0].key, opt.key]
				this.allInputData.popupData.popupName = prodData && prodData.componentName || 'PopupInsuranceChoose'
				this.ckCancel()
				this.$emit('closeProductsChoose')
			},
			clearRecordKey (index) {
				var searchRecord = JSON.parse(localStorage.getItem(this.storageKey))
				searchRecord.splice(index, 1)
				this.searchRecord = searchRecord
				return false;
			},
			clearAllRecordKeys () {
				this.searchRecord = []
			},
			// gotoProvidePB() {
			// 	let gotoUrl = `${location.origin}/planBook/projectGroup/planbookCollect/index.html`
			// 	if (location.hostname.search(/192\.168|localhost/) !== -1) {
			// 	    gotoUrl = `//${location.hostname}:9200/planbookCollect/index.html`
			// 	}
			// 	location.href = gotoUrl
			// },
			ckCloseBtn() {
				this.ckCancel()
				//关闭产品列表浮层
				this.$emit('closeProductsChoose')
			},
			ckCancel() {
				this.$parent.showProductsSearch = ''
			},
			gotoFeedback() {
				location.href = `${location.origin}/planBook/projectGroup/feedback/index.html?type=0&planbookId=${planbookId}`  //意见反馈跳转链接
			},
			getResultNum (list) {
				let num = 0
				list && list.map(comp => {
					comp.productList && comp.productList.forEach(ins => {
						num ++
					})
				})
				return num
			}
		},
		updated() {
			this.getSearchFixedHeight()
		},
	    watch: {
	    	keyword () {
	    		this.finishSearch = false
	    	},
	        searchRecord: {
	            deep: true,
	            handler: function () {
	                localStorage.setItem(this.storageKey, JSON.stringify(this.searchRecord))
	            }
	        }
	    },
	    computed: {
            insuredInfo () {
                return helperJs.convertProductData({inputData: this.inputData}).personData.personOrderList[0]
            },
            filterSearchResultList() {
            	this.productCount = 0

            	let filterSearchResultList = []
            	;(this.searchResultList || []).map(comp => {
            		let companyData = {
            			companyId: comp.companyId,
            			name: comp.name
            		}
            		if (comp.productList.some(prod => !prod.filterFlag)) {
            			companyData.productList = comp.productList.filter(prod => {
            				this.productCount ++
            				return !prod.filterFlag
            			})
            		}
            		if (companyData.productList) {
            			filterSearchResultList.push(companyData)
            		}
            	})
            	return filterSearchResultList
            }
        }
	}
</script>

<style>
	@import 'variables.css';
	.products_search {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		z-index: 200;
		& .products_search_body {
			position: absolute;
			left: 0;
			top: 10%;
			width: 100%;
			height: 90%;
			overflow: hidden;
			background: #fff;
			& .products_search_fixed {
				position: fixed;
				top: 10%;
				left: 0;
				width: 100%;
				z-index: 600;
				& .search_title {
				    position: relative;
				    display: -webkit-box;
				    border-bottom: 1px solid var(--gray_e5);
				    background: #fff;
				    padding: 26px 22px;
				    color: #333;
				    & span {
				        display: -webkit-box;
				        -webkit-box-flex: 1;
				        -webkit-box-pack: center;
				        -webkit-box-align: center;
				        font-size: 32px;
				        font-weight: bold;
				        line-height: 46px;
				    }
				    & i.icon-close_line {
				        font-size: 48px;
				       @mixin vertical_center;
				        right: 30px;
				        color: var(--gray_ccc);
				    }
				}
				& .search_wrapper {
					width: 100%;
					background: #fff;
					font-weight: bold;
					z-index: 600;
					text-align: left;
					& .search_input_wrapper {
						padding: 14px 30px;
						& p.search_bar {
							position: relative;
							display: inline-block;
							width: 87%;
							padding: 4px 0;
							background: #F0F0F0;
							text-align: left;
							border-radius: 60px;
							vertical-align: middle;
							line-height: normal;
							& i {
								right: unset;
								left: 9px;
								font-size: 36px;
								color: var(--gray_999);
								@mixin fontIconCenter;
								margin-top: -20px;
								&.icon-close_circle_surface {
									right: 9px;
									left: unset;
									font-weight: normal;
									color: var(--gray_ccc);
								}
							}
							& input {
								width: 90%;
								margin-left: 32px;
								border: none;
								vertical-align: middle;
								padding: 0.3125rem 0.375rem 0.3125rem;
								&::-webkit-input-placeholder {
									color: var(--gray_999);
								}
							}
						}
						& span.search_btn {
							display: inline-block;
							width: 36px;
							height: 30px;
							line-height: 30px;
							font-size: 30px;
							font-weight: normal;
							text-align: right;
						}
					}
					& .search_tips {
					    padding: 26px 30px 27px;
					    font-size: 26px;
					    color: var(--gray_666);
					    line-height: normal;
					    background: #fff;
					    border-bottom: 1px solid #e5e5e5;
					    font-weight: normal;
					    & i {
					        margin-right: 8px;
					        font-size: 30px;
					        vertical-align: middle;
					    }
					}
				}
			}
			& .search_history_type {
				& .search_history_dl {
					padding: 30px 30px 12px 30px;
					line-height: normal;
					background: #fff;
					font-size: 28px;
					color: #333;
					& dt {
						padding-bottom: 30px;
						font-size: 32px;
						font-weight: bold;
					}
					& dd {
						position: relative;
						display: inline-block;
						margin-right: 18px;
						margin-bottom: 18px;
						padding: 14px 24px;
						color: var(--gray_333);
						border: 1px solid var(--gray_e5);
						border-radius: 12px;
						background: #f8f8f8;
					}
				}
				& .clear_search_icon {
					height: 64px;
					line-height: 64px;
					color: var(--gray_999);
					font-size: 26px;
					text-align: center;
				}
			}
			& .search_result_title {
				line-height: normal;
				padding: 26px 0 26px 30px;
				font-size: 30px;
				& i {
					margin-right: 8px;
					font-size: 36px;
					color: var(--gray_999);
				}
			}
			& .searchResultDl {
				margin: 0 auto 18px;
				padding-left: 28px;
				font-size: 30px;
				background: #fff;
				& dt {
					height: 40px;
					line-height: 40px;
					color: var(--gray_333);
					border-bottom: none;
					font-size: 34px;
					font-weight: bold;
				}
				& dd {
					position: relative;
					border-bottom: 1px solid var(--gray_e5);
					@mixin nowrap;
					width: 100%;
					padding-right: 20px;
					& .product_name {
						position: relative;
						padding: 24px 0;
						& span {
							display: inline-block;
							max-width: 80%;
							@mixin nowrap;
						}
						& i {
						@mixin vertical_center;
							color: var(--gray_ccc);
						}
					}
					& .insurance_list {
						padding-bottom: 14px;
						& li {
							width: 100%;
							padding: 0 0 18px 32px;
							@mixin nowrap;
							display: block;
						}
					}
					&:last-child {
						border-bottom: none;
					}
				}
			}
			& .no_more_result {
				text-align: center;
				color: var(--gray_999);
				font-size: 26px;
				line-height: normal;
				& span {
					display: inline-block;
					padding: 20px 0;
					box-sizing: content-box;
				}
				padding-bottom: constant(safe-area-inset-bottom);
				padding-bottom: env(safe-area-inset-bottom);
				box-sizing: content-box;
			}
		}
	}
</style>
