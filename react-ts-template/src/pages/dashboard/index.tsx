import './index.css'

export default function Dashboard() : any {
  return (
    <div className="rts_dashboard">
      <h2 onClick={() => {
        window.location.href = 'https://zh-hans.reactjs.org/docs/getting-started.html'
      }}>您好，欢迎学习react!</h2>
    </div>
  );
}