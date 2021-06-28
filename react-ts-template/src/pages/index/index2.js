import logo from '@/assets/svg/logo.svg';
import './app.css';
import './index.css';
import styles from './index.module.css';
import './index.scss';

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
        <a className="App-link app_link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
        <a className={styles.app_link} href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
