import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import HangmanGame from './components/HangmanGame';
import ConfettiCannon from 'react-native-confetti-cannon'

export default function App() {

  const onSuccess = () => {
    this.explosion && this.explosion.start()
  }
  return (
    <View style={styles.container}>
      <HangmanGame onSuccess={onSuccess} />
      <ConfettiCannon autoStart={false} fadeOut={true} count={200} origin={{x: -10, y: 0}} ref={ref => this.explosion = ref} /> 
        {/* copied from their docs on NPM */}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
