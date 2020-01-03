import React, { Component } from 'react';

class FeatureList extends Component {
    constructor(props) {
        super(props);
        this.gotoTopic = this.gotoTopic.bind(this)
        this.state = {
            showAllFeature: false,
        }
    }
    gotoTopic (sell) {
        if (window.appBridge && window.appBridge.isApp() && sell.contentId) {  // article、question、liveCourse、videoSeries
            switch (sell.type) {
                case 'videoSeries':  //视频跳转
                    window.appBridge.gotoNativeView({
                        type: 'topic',
                        data: {
                            turnType: 2,
                            contentType: 1,
                            contentId: sell.contentId,
                            newsType: 3
                        }
                    });
                    break;
                case 'allPoster':  //海报跳转
                    if (window.appBridge && window.appBridge.checkAppFeature('GOTO_POSTER')) {
                        window.appBridge.gotoNativeView({
                            type: "poster",
                            data: {
                                tabId: 6
                            }
                        })
                    } else {
                        window.location.href = sell.link
                    }

                    break;
                default:  //默认h5跳转，如直播跳转
                    window.location.href = sell.url || sell.link
            }
        } else {
            window.location.href = sell.url || sell.link
        }
    }
    render() {
        let self = this
        function ItemList(props) {
            const productSellData = props.productSellData;
            let listItems = []
            if (productSellData && productSellData.contentArr) {
                listItems = productSellData.contentArr.map((sell, i) =>
                    <li key={sell.des} onClick={() => self.gotoTopic(sell)} style={{"display": i < productSellData.maxLength || self.state.showAllFeature ? 'inherit' : 'none'}}>
                        <p>
                            <span className="icon">{sell.tab}</span>
                            <span>{sell.des}</span>
                        </p>
                    </li>
                );
            }
            return (
                <ul>
                    {listItems}
                    <li onClick={() => {
                        self.setState({
                            showAllFeature: !self.state.showAllFeature
                        })
                    }}>
                        <span>展开全部</span>
                        {
                            self.state.showAllFeature ? (<i className="iconfont icon-arrows_up"></i>) : (<i className="iconfont icon-arrows_down"></i>)
                        }
                    </li>
                </ul>
            );
        }

        return (
            <div className="featureMainDiv">
                <header>{(this.props.inforData.productSellData && this.props.inforData.productSellData.title) || ''}</header>
                <ItemList productSellData={this.props.inforData.productSellData}/>
            </div>
        );
    }
}

export default FeatureList