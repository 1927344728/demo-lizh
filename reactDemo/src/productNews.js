import React, { Component } from 'react';
// import ReactDOM from 'react-dom';
// import PropTypes from 'prop-types';

import './productNews.css';

import axios from 'axios';
import helper from './js/helper.js'

import HeaderItem from './components/productNews/headerItem.js'
import PosterList from './components/productNews/posterList.js'
import FeatureList from './components/productNews/featureList.js'


class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			inforData: {
				// iconData: {},
				// itemData: {},
				// posterData: {},
				// productSellData: {}
			}
		}
		document.body.style.background = "#eee"
	}
	componentDidMount () {
		let self = this
		axios.get(`${helper.judgeEnv()}/planBook/getPlanbookInfomation?insuranceTypeId=${helper.getQueryString(`insuranceTypeId`) * 1}`, {
			withCredentials: true
		}).then(res => {
			self.setState({
				inforData: res.data.data.inforData
			});
			window.document.title = self.state.inforData.title
		});
	}
	render() {
		return (
			<div className="App">
				<HeaderItem inforData={this.state.inforData}/>
				<PosterList inforData={this.state.inforData}/>
				<FeatureList inforData={this.state.inforData}/>
			</div>
		);
	}
}

export default App;
