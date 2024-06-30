import AsyncStorage from "@react-native-async-storage/async-storage";
import { categories } from "./words";

export const getRandomCategory = () => {
    const categoryKeys = Object.keys(categories);
    const randomCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)]
    return randomCategory
}

export const getRandomWordFromCategory = (category, streak = 0) => {
    const words = categories[category]
    
    const filteredWords = words.filter(wordObject => streak > 7 ? true : wordObject.hint === "")
    console.log(filteredWords)
    return filteredWords[Math.floor(Math.random() * filteredWords.length)]
}

export const loadScores = async () => {
    try {
        const savedStreak = await AsyncStorage.getItem('streak')
        const savedHighScore = await AsyncStorage.getItem('highScore')

        return {
            streak: savedStreak !== null ? parseInt(savedStreak, 10) : 0, 
            highScore: savedHighScore !== null ? parseInt(savedHighScore, 10) : 0, 
        }
    } catch (err) {
        console.error('Failed to load scores from storage: ', error)
        return {streak: 0, highScore: 0}
    }
}

export const calculateWordDifficulty = async () => {
    const streak = await AsyncStorage.getItem('streak');
    if (streak >= 8) {
      return 'hard';
    } else if (streak >= 4) {
      return 'moderate';
    } else {
      return 'easy';
    }
};