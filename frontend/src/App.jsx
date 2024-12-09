import Header from "./components/Header.jsx"
import SearchBar from "./components/sub_components/SearchBar.jsx"
import BeatList from "./components/BeatList.jsx"
import Upload from "./components/Upload.jsx"
// import Sandbox from "./components/Sandbox.jsx"
import { useState } from "react"

function App() {
  const [showUploadView, setShowUploadView] = useState(false);
  const [searchContents, setSearchContents] = useState(null);

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
        <SearchBar setSearchContents={setSearchContents}/>
        <BeatList searchContents={searchContents}/>
        {/* <Sandbox /> */}
      </div>
    </div>
  )
}

export default App
