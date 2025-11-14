import { useContext } from "react"
import { AuthContext } from "../context-api/AuthContextProvider"

const useAuth = () => {
    const context = useContext(AuthContext)

    if (context === undefined) throw new Error('useAuth must be used within a AuthContextProvider')

    return context
}

export default useAuth