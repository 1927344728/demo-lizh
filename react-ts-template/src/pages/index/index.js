import logo from '@/assets/svg/logo.svg';
import './index.css';
import './index.scss';

console.log(process.env.REACT_APP_AUTHOR)
console.log(process.env.AUTHOR_NAME)

let a = "a";
let b = 'b';
console.log(a + b);
function App() {
  return (
    <div className="App"
      style={
        {color: process.env.REACT_APP_MAIN_COLOR}
    }>
      <header className="App-header">
        <img src={logo}
          className="App-logo"
          alt="logo"/>
        <p>
          Edit
          <code>src/App.js</code>
          and save to reload.
        </p>
        <a className="App-link env_variable" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
