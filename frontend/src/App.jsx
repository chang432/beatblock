import Header from "./components/Header.jsx"
import SearchBar from "./components/sub_components/SearchBar.jsx"
import BeatList from "./components/BeatList.jsx"
import Upload from "./components/Upload.jsx"
import Axios from 'axios'
import API from './api/arweaveAPI.js'
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

  const handleClick = async () => {
    // const payload = {
    //   target: "u4p-8HMKgQtah3MTsCZbCdxMcOcMFH_0sTPFum6HKdE"
    // };

    // try {
    //   const response = await Axios.post("http://127.0.0.1:5000/api/subsidize", payload);
    //   console.log("Response from Flask:", response.data);
    // } catch (error) {
    //   console.error("Error calling Flask API:", error.message);
    // }

    const api = new API(true);
    await api.hasWalletUsedSubsidization("u4p-8HMKgQtah3MTsCZbCdxMcOcMFH_0sTPFum6HKdE");
  };

  return (
    <div className="bg-black min-h-screen" style={{ "color":"#CCCCCC" }}>
      {showUploadView && <Upload handleUploadExitClick={handleUploadExitClick}/>}
      <Header handleUploadClick={handleUploadClick}/>
      <div className="px-10">
        <SearchBar setSearchContents={setSearchContents}/>
        <BeatList searchContents={searchContents}/>
        {/* <Sandbox /> */}
      </div>
      <button onClick={handleClick}>TEST</button>
    </div>
  )
}

export default App
