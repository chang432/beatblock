import Header from "./components/Header.jsx"
import BeatList from "./components/BeatList.jsx"
import Test from "./components/Test.jsx"
import Upload from "./components/Upload.jsx"
import { useState } from "react"

function App() {
  const [showUploadView, setShowUploadView] = useState(false);

  const handleUploadClick = () => {
    setShowUploadView(true);
  }

  const handleUploadExitClick = () => {
    setShowUploadView(false);
  }

  return (
    <div className="bg-black min-h-screen" style={{ "color":"#CCCCCC" }}>
      {showUploadView && <Upload handleUploadExitClick={handleUploadExitClick}/>}
      <Header handleUploadClick={handleUploadClick}/>
      <div className="px-10">
        <BeatList />
      </div>
      <Test />
    </div>
  )
}

export default App
