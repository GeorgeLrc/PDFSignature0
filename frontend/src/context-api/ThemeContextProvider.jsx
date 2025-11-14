/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useReducer } from "react"

export const ThemeContext = createContext()

const initialState = {
    theme: localStorage.getItem('theme') || 'light'
}

const themeRedcuer = (state, action) => {
    switch (action.type) {
        case 'theme/toggle-theme':
            return { ...state, theme: action.payload, }
        default:
            return state
    }
}

export default function ThemeContextProvider({ children }) {
    const [{ theme }, dispatch] = useReducer(themeRedcuer, initialState)

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
            document.documentElement.classList.remove('light')
        }
        else {
            document.documentElement.classList.remove('dark')
            document.documentElement.classList.add('light')
        }
    }, [theme])

    const changeTheme = (theme) => {
        localStorage.setItem('theme', theme)
        dispatch({ type: 'theme/toggle-theme', payload: theme })
    }

    const isDark = theme === 'dark'

    return (
        <ThemeContext.Provider value={{ theme, changeTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    )
}
