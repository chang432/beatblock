import { useRef } from "react"

const SearchBar = ({setSearchContents}) => {   
    var searchBarInput = new useRef(null);

    const handleSearchClick = () => {
        // console.log(searchBarInput.current.value);
        if (searchBarInput.current.value != "") {
            setSearchContents(searchBarInput.current.value);
        } else {
            alert("Please enter input in the search bar!")
        }
    }

    return (
        <div className="flex flex-row space-x-3 justify-end">
            <input ref={searchBarInput} type="text" className="w-80 text-black" placeholder="Enter TX ID Or Wallet ID" />
            <button onClick={handleSearchClick}>Search</button>
        </div>
    )
}

export default SearchBar;