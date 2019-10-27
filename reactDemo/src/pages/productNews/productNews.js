import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import logo from './logo.svg';
import './productNews.css';

import axios from 'axios';
import helper from './helper.js'

let insuranceTypeId = helper.getQueryString(`insuranceTypeId`)
class HeaderItem extends Component {
	constructor(props) {
		super(props);
		this.state = {temperature: ''};
	}
	componentDidMount () {
		axios.get(`http://app.winbaoxian.cn/planBook/getPlanbookInfomation?insuranceTypeId=3536`)
		.then(res => {
			const posts = res.data.data.children.map(obj => obj.data);
			this.setState({ posts });
		});
	}
	render () {
		return (
			<div className="headerItemMainDiv">
				<div className="headerItemContentDiv">
					<div className="iconDiv">
						<ul>
							<li>
								<figure>
									<img src="//img.winbaoxian.com/autoUpload/planbook/WechatIMG5080_9e655217829cbfc.png"/>
									<figcaption>讲公司</figcaption>
								</figure>
							</li>
						</ul>
					</div>
					<footer>
						<img src=""/>
						<span></span>
						<i data-v-3a3c7d91="" className="iconfont icon-arrows_right"></i>
					</footer>
				</div>
				<div className="backgroundDiv"></div>
			</div>
		)
	}
}

class App extends Component {
	render() {
		return (
			<div className="App">
				<HeaderItem/>
			</div>
		);
	}
}


export default App;
