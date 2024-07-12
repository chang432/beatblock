const Header = ({handleLoginClick}) => {
    return (
        <div className="w-full h-32 flex flex-row px-10 justify-between items-center">
            <h1 className="text-6xl font-custom" style={{ color: "#2CEB06" }}>Beat Block</h1>
            <div className="flex flex-row space-x-20 items-center">
                <p>About</p>
                <button onClick={handleLoginClick}>Login</button>
            </div>
        </div>
    )
}

export default Header