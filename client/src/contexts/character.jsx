import { createContext, useState } from "react";

export const CharacterContext = createContext({
    currentCharacter: null,
    setCurrentCharacter: () => null
})

export const CharacterProvider = ({ children }) => {
    const [currentCharacter, setCurrentCharacter] = useState(null);
    const value = { currentCharacter, setCurrentCharacter }

    return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>
}