import React, { Component } from 'react';
import ReactSwipe from 'react-swipe';
console.log(typeof ReactSwipes)
class PosterPreview extends Component {
    render() {
        let self = this
        const swipeOpt = this.props.swipeOpt;
        function Header(props) {
            const posterData = props.posterData;
            return (
                <header className="posterPreviewHeader">
                    <p>{swipeOpt && swipeOpt.startSlide + 1}/{posterData && posterData.contentArr.length}</p>
                    <i className="iconfont icon-close_circle_line" onClick={() => {
                        self.props.showOrHidePopup(false)
                    }}></i>
                </header>
            )
        }


        function PosterSwipe(props) {
            const posterData = props.posterData;
            let poseterPopupList = ''
            if (posterData && posterData.contentArr.length) {
                poseterPopupList = posterData.contentArr.map((item, index) => (
                    <div className="item" key={item.previewImg}>
                        <img src={item.previewImg} alt=""/>
                    </div>)
                );
            }
            return (
                poseterPopupList ? (
                    <ReactSwipe className="carousel posterPopupSwipes" swipeOptions={swipeOpt}>
                        {poseterPopupList}
                    </ReactSwipe>
                ) : ''
            );
        }


        function Footer (props) {
            let shareInfo = [
                {
                    key: 'qq',
                    icon: 'iconfont icon-qq',
                    tx: 'qq'
                }, {
                    key: 'wechat',
                    icon: 'iconfont icon-weichat',
                    tx: '朋友圈'
                }, {
                    key: 'wechatSurface',
                    icon: 'iconfont icon-wechat_surface',
                    tx: '微信好友'
                }, {
                    key: 'download',
                    icon: 'iconfont icon-download',
                    tx: '下载'
                }
            ];
            let liDom = shareInfo.map( (info) =>
                (
                    <li key={info.key}>
                        <span className={info.key}>
                            <i className={info.icon}></i>
                        </span>
                        <p>{info.tx}</p>
                    </li>
                )
            );
            return (
                <footer className="shareIconFooter">
                    <ul>
                        {liDom}
                    </ul>
                </footer>
            )
        }
        return (
            <div className="posterPopupDiv">
                <div className="posterPreviewDiv">
                    <Header posterData={this.props.posterData}></Header>
                    <PosterSwipe posterData={this.props.posterData}></PosterSwipe>
                    <Footer></Footer>
                </div>
            </div>
        )
    }
}

class PosterList extends Component {
    constructor(props) {
        super(props);
        let self = this
        self.state = {
            showPosterPopup: false,
            swipeOpt: {
                startSlide: 0,
                speed: 400,
                auto: 3000,
                continuous: true,
                disableScroll: false,
                stopPropagation: false,
                callback: function(index, elem) {},
                transitionEnd: function(index, elem) {
                    self.showOrHidePopup(true, index)
                }
            }
        }
        self.showOrHidePopup = self.showOrHidePopup.bind(self)
    }
    showOrHidePopup (bool, index) {
        index === undefined ||this.setState({
            swipeOpt: Object.assign(this.state.swipeOpt, {
                startSlide: index
            })
        })
        this.setState({
            showPosterPopup: bool
        })
    }
    render() {
        let self = this
        const swipeOpt = this.state.swipeOpt;
        function ItemList(props) {
            const posterData = props.posterData;
            let listItems = []
            if (posterData && posterData.contentArr) {
                listItems = posterData.contentArr.map((poster, pi) =>
                    <li key={poster.previewImg} onClick={() => {
                        self.showOrHidePopup(true, pi)
                    }}>
                        <a href="javascript:;">
                            <img src={poster.previewImg} alt=""/>
                        </a>
                    </li>
                );
            }
            return (
                <ul>
                    {listItems}
                    <li>
                        <a href={(posterData && posterData.jumpUrl) || ''}>全部海报</a>
                    </li>
                </ul>
            );
        }


        return (
            <div className="posterMainDiv">
                <header>{(this.props.inforData.posterData && this.props.inforData.posterData.title) || ''}</header>
                <ItemList posterData={this.props.inforData.posterData}/>
                {this.state.showPosterPopup ? (
                    <PosterPreview 
                        posterData={this.props.inforData.posterData}
                        showOrHidePopup={this.showOrHidePopup}
                        swipeOpt={swipeOpt}></PosterPreview>
                ) :''}
            </div>
        );
    }
}

export default PosterList