import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import logo from './logo.svg';
import './App.css';


function BoilingVerdict(props) {
  if (props.celsius >= 100) {
    return <p>The water would boil.</p>;
  }
  return <p>The water would not boil.</p>;
}
class Calculator extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {temperature: ''};
  }

  handleChange(e) {
    this.setState({temperature: e.target.value});
  }

  render() {
    return (
      <fieldset>
        <legend>Enter temperature in Celsius:</legend>
        <input value={this.state.temperature} onChange={this.handleChange} />
        <BoilingVerdict celsius={parseFloat(this.state.temperature)} />
      </fieldset>
    );
  }
}


class Greeting extends React.Component {
  render() {
    return (
      <h1>Hello, {this.props.name.name}</h1>
    );
  }
}

Greeting.propTypes = {
  name: PropTypes.object
};


// class NameForm extends React.Component {
//   constructor(props) {
//     super(props);
//     this.handleSubmit = this.handleSubmit.bind(this);
//   }

//   handleSubmit(event) {
//     alert('A name was submitted: ' + this.input.value);
//     event.preventDefault();
//   }

//   render() {
//     return (
//       <form onSubmit={this.handleSubmit}>
//         <label>
//           Name:
//           <input type="text" ref={(input) => this.input = input} />
//         </label>
//         <input type="submit" value="Submit" />
//       </form>
//     );
//   }
// }



class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    debugger
    this.setState({ hasError: true });
    // You can also log the error to an error reporting service
    console.log(error, info);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}


class HelloMessage extends React.Component {
  render() {
    return <div>Hello <x-search>{this.props.name}</x-search>!</div>;
  }
}

class App extends Component {
	render() {
		return (
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h1 className="App-title">Welcome to React</h1>
				</header>
				<p className="App-intro">
					To get started, edit <code>src/App.js</code> and save to reload.
				</p>
        <ErrorBoundary>
  				<Calculator />
  				<Greeting name={{
  					"name": "lizh"
  				}} />
          <HelloMessage name="lizh" />
				</ErrorBoundary>
			</div>
		);
	}
}


export default App;
