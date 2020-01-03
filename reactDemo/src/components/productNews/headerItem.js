import React, { Component } from 'react';

class HeaderItem extends Component {
    render () {
        function IconList(props) {
            const iconData = props.iconData;
            let listItems = []
            if (iconData && iconData.contentArr) {
                listItems = iconData.contentArr.map((icon) =>
                    <li key={icon.iconUrl}>
                        <figure onClick={() => {
                            window.location.href = icon.url
                        }}>
                            <img src={icon.iconUrl} alt=""/>
                            <figcaption>{icon.name}</figcaption>
                        </figure>
                    </li>
                );
            }
            return (
                <ul>
                    {listItems}
                </ul>
            );
        }


        function ItemList(props) {
            function handleClick(url) {
                window.location.href = url
            }
            const itemData = props.itemData;
            let listItems = []
            if (itemData && itemData.contentArr) {
                listItems = itemData.contentArr.map((item) =>
                    <li key={item.url} onClick={() => handleClick(item.url)}>
                        <img src="//img.winbaoxian.com/autoUpload/planbook/__3ac270524f1e788.png" alt=""/>
                        |<span>{item.des}</span>
                        <i data-v-3a3c7d91="" className="iconfont icon-arrows_right"></i>
                    </li>
                );
            }
            return (
                <ul>
                    {listItems}
                </ul>
            );
        }

        return (
            <div className="headerItemMainDiv">
                <div className="headerItemContentDiv">
                    <div className="iconDiv">
                        <IconList iconData={this.props.inforData.iconData} />
                    </div>
                    <footer className="itemFooter">
                        <ItemList itemData={this.props.inforData.itemData}/>
                    </footer>
                </div>
                <div className="backgroundDiv"></div>
            </div>
        )
    }
}

export default HeaderItem