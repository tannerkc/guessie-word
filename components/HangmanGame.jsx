import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native'
import React, { memo, useEffect, useMemo, useRef, useState } from 'react'
import { getRandomCategory, getRandomWordFromCategory, loadScores } from '../lib/util';
import * as Progress from 'react-native-progress'
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width

const HangmanGame = ({onSuccess}) => {
    const [category, setCategory] = useState(getRandomCategory())
    const [wordObject, setWord] = useState({word: 'start', hint: ''})
    const [guessedLetters, setGuessedLetters] = useState([])
    const [wrongGuesses, setWrongGuesses] = useState(0)
    const [streak, setStreak] = useState(null)
    const [highScore, setHighScore] = useState(null)

    const [gameInit, setGameInit] = useState(false)

    const maxWrongGuesses = 6;
    const altKeys = "1234567890-&'".split("")
    const keyboard = "qwertyuiopasdfghjklzxcvbnm".split("")

    const isGameOver = wrongGuesses >= maxWrongGuesses
    const isGameWon = wordObject.word.replace(/\s/g, '').split('').every(letter => guessedLetters.includes(letter))

    useEffect(() => {
        if (streak) return
        const initializeScores = async () => {
            const { streak, highScore } = await loadScores()
            setStreak(streak)
            setHighScore(highScore)
            setTimeout(() => {
                resetWord()
                if (!gameInit) setGameInit(true)
            }, 2500)
        }
        initializeScores()
    }, [])

    useEffect(() => {
        if(!gameInit) return

        if (isGameOver) {
            handleGameOver()
        }
        else if (isGameWon) {
            handleGameWon()
        }
    }, [isGameWon, isGameOver])
    
    const resetWord = () => {
        const newCategory = getRandomCategory()
        setCategory(newCategory)
        setGuessedLetters([])
        setWrongGuesses(0)
        setWord(getRandomWordFromCategory(newCategory, streak))
    }

    const handleGameOver = async () => {
        await AsyncStorage.setItem('streak', '0')
        setStreak(0)
        setTimeout(resetWord, 2000)
    }

    const handleGameWon = async () => {
        const newStreak = streak + 1
        await AsyncStorage.setItem('streak', newStreak.toString())
        setStreak(newStreak)

        if (newStreak > highScore) {
            await AsyncStorage.setItem('highScore', newStreak.toString())
            setHighScore(newStreak)
        }
        onSuccess()
        setTimeout(resetWord, 2000)
    }

    const handleGuess = (letter) => {
        setGuessedLetters([...guessedLetters, letter]) // deconstruct any previously stored guessed letters
        if (!wordObject.word.includes(letter)) {
            setWrongGuesses(wrongGuesses + 1)
        }
    }

    const renderWord = useMemo(() => {
        console.log(wordObject.word)
        return wordObject.word.split('').map((letter, index) => (
            /\s/g.test(letter) ? (
                <View key={index} style={{width: 25}}></View> // blank space if challenge is multi worded
            ) : (
                <View key={index} style={styles.glassSquare}>
                    <Text style={styles.letter}>
                        {guessedLetters.includes(letter) ? letter : ''}
                    </Text>
                </View>
            )
        ))
    }, [wordObject, guessedLetters])

    const renderAltKeys = useMemo(() => {
        return altKeys.map((letter, index) => (
            <TouchableOpacity
                key={index} //should be better than this but..
                style={[
                    styles.keyboardButton,
                    guessedLetters.includes(letter) ? styles.disabledButton : {}
                ]}
                onPress={() => handleGuess(letter)}
                disabled={guessedLetters.includes(letter)}
            >
                <Text style={[styles.keyboardButtonText, guessedLetters.includes(letter) ? styles.disabledButtonText : {}]}>{letter}</Text>
            </TouchableOpacity>
        ))
    }, [guessedLetters])

    const renderKeyboard = useMemo(() => {
        return keyboard.map((letter, index) => (
            <TouchableOpacity
                key={index} //should be better than this but..
                style={[
                    styles.keyboardButton,
                    guessedLetters.includes(letter) ? styles.disabledButton : {}
                ]}
                onPress={() => handleGuess(letter)}
                disabled={guessedLetters.includes(letter)}
            >
                <Text style={[styles.keyboardButtonText, guessedLetters.includes(letter) ? styles.disabledButtonText : {}]}>{letter}</Text>
            </TouchableOpacity>
        ))
    }, [guessedLetters])

    const opacityAnimation = useRef(new Animated.Value(0)).current;
    const opacityStyle = { opacity: opacityAnimation };

    useEffect(() => {
        if(gameInit) {
            Animated.timing(opacityAnimation, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }).start();
        }
    }, [gameInit])

  return (
    <View style={styles.container}>
        <Animated.View style={{...styles.streakContainer, ...opacityStyle}}>
            <Text style={styles.streakText}>streak</Text>
            <Text style={styles.streak}>{streak}</Text>
        </Animated.View>
        <Animated.View style={{...styles.highScoreContainer, ...opacityStyle}}>
            <Text style={styles.streakText}>highscore</Text>
            <Text style={styles.highScore}>{highScore}</Text>
        </Animated.View>

        <Animated.View style={{...styles.wrapper,...opacityStyle}}>
            <Text style={styles.title}>{category}</Text>
            <Text style={styles.hint}>{wordObject.hint}</Text>
            <View style={styles.wordContainer}>{renderWord}</View>
        </Animated.View>

        <View style={styles.progressContainer}>
            <Progress.Bar progress={(wrongGuesses / maxWrongGuesses) * 1} indeterminate={!gameInit} color='rgba(23, 23, 23, 0.95)' borderColor='#fff' unfilledColor='#fff' width={300} />
        </View>
        {
            isGameOver ? (
                <Text style={styles.gameOverText}>Nice try! The word was: {wordObject.word}</Text>
            ) : isGameWon ? (
                <Text style={styles.title}>Great Job! 🥳</Text>
            ) : (
                <Animated.View style={{...styles.wrapper,...opacityStyle}}>
                    <View style={styles.keyboardContainer}>
                        {renderAltKeys}
                    </View>
                    <View style={styles.keyboardContainer}>
                        {renderKeyboard}
                    </View>
                </Animated.View>
            )
        }
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: screenWidth,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(23,23,23,0.95)'
    },
    wrapper: {
        // flex: 1,
        width: screenWidth,
        justifyContent: 'center',
        alignItems: 'center',
        // padding: 20,
        // backgroundColor: 'rgba(23,23,23,0.95)'
    },
    title: {
        fontSize: 32,
        marginBottom: 5,
        color: '#fff',
        textTransform: 'capitalize'
    },
    hint: {
        marginBottom: 20,
        fontSize: 12,
        fontWeight: '200',
        color: 'rgba(255,255,255,0.65)'
    },
    streakContainer: {
        position: 'absolute',
        top: 80,
        left: 40,
    },
    streakText: {
        color: '#fff'
    },
    streak:{
        color: '#fff',
        fontSize: 30,
        fontWeight: 'bold'
    },
    highScore: {
        color: '#fff',
        fontSize: 30,
        alignSelf: 'flex-end'
    },
    highScoreContainer: {
        position: 'absolute',
        top: 80,
        right: 40,
    },
    keyboardContainer: {
        flexDirection: 'row', // React Native by default uses flex with flexDirection Column
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 20,
        maxWidth: 500
    },
    wordContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        width: '100%',
        maxWidth: 950,
        justifyContent: 'center'
    },
    glassSquare: {
        maxWidth: 45,
        flex: 1, // this combo let's larger words shrink down to fit the screen
        height: 45,
        margin: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255, 255, 0.3)'
    },
    letter: {
        fontSize: 20,
        color: '#fff'
    },
    keyboardButton: {
        margin: 5,
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        borderRadius: 5
    },
    keyboardButtonText: {
        color: '#333',
        fontSize: 16
    },
    disabledButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)'
    },
    disabledButtonText: {
        color: 'rgba(255, 255, 255, 0.45)'
    },
    progressContainer: {
        marginBottom: 20
    },
    gameOverText: {
        fontSize: 25,
        color: 'rgba(255, 255, 255, 0.75)'
    }
})

export default memo(HangmanGame)