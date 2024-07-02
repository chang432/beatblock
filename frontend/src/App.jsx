import Header from "./components/Header.jsx"
import BeatList from "./components/BeatList.jsx"
import Test from "./components/Test.jsx"

function App() {
  return (
    <div className="bg-black min-h-screen" style={{ "color":"#CCCCCC" }}>
      <Header />
      <div className="px-10">
        <BeatList />
      </div>
      <Test />
    </div>
  )
}

export default App
