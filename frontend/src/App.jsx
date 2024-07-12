import Header from "./components/Header.jsx"
import BeatList from "./components/BeatList.jsx"
import Test from "./components/Test.jsx"
import Login from "./components/Login.jsx"
import { useState } from "react"

function App() {
  const [showLoginView, setShowLoginView] = useState(false);

  const handleLoginClick = () => {
    setShowLoginView(true);
  }

  const handleLoginExitClick = () => {
    setShowLoginView(false);
  }

  return (
    <div className="bg-black min-h-screen" style={{ "color":"#CCCCCC" }}>
      {showLoginView && <Login handleLoginExitClick={handleLoginExitClick}/>}
      <Header handleLoginClick={handleLoginClick}/>
      <div className="px-10">
        <BeatList />
      </div>
      <Test />
    </div>
  )
}

export default App
