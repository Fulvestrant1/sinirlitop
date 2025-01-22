import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

export default function App() {
  const [level, setLevel] = useState(1);
  const [ballPositions, setBallPositions] = useState([{ top: 0, left: 0, isCorrect: true }]);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showLevelText, setShowLevelText] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); // Başlangıç hızı, 1000ms
  const [gameOver, setGameOver] = useState(false);
  const [ballClicked, setBallClicked] = useState(0); // Topa tıklama sayısı
  const [ballVisible, setBallVisible] = useState(true); // Topun görünürlüğü
  const [correctBall, setCorrectBall] = useState(null); // Correct ball tracking
  const [showIntro, setShowIntro] = useState(true); // Başlangıç animasyonunu kontrol et
  const scaleValue = new Animated.Value(1); // Animasyon için ölçek değeri

  // Animasyon başlatma
  useEffect(() => {
    if (showIntro) {
      // "SinirliTop" yazısının büyüyerek kaybolma animasyonu
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 3, // Büyüme oranı
          duration: 2000, // Animasyon süresi
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0, // Kaybolma
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowIntro(false); // Animasyon bittiğinde intro'yu gizle
      });
    }
  }, [showIntro]);

  // Oyunun başlatılması ve topun hareket etmesi
  useEffect(() => {
    let ballMoveTimer;

    if (isPlaying && !gameOver && !showCongrats && ballVisible) {
      // Topların hareket etmesi
      ballMoveTimer = setInterval(() => {
        setBallPositions((prevPositions) =>
          prevPositions.map((ball) => ({
            top: Math.floor(Math.random() * 95), // top %95 ekran yüksekliğinde hareket eder
            left: Math.floor(Math.random() * 95), // %95 ekran genişliğinde hareket eder
            isCorrect: ball.isCorrect // Correctness flag remains same
          }))
        );
      }, speed); // Hız seviye arttıkça hızlanacak
    }

    return () => {
      clearInterval(ballMoveTimer);
    };
  }, [isPlaying, gameOver, showCongrats, speed, ballVisible]);

  // Topa tıklama ve seviye geçişi
  const handleBallClick = (isCorrect) => {
    setBallClicked(ballClicked + 1); // Tıklama sayısını arttır
    setBallVisible(false); // Top kaybolur

    if (isCorrect) {
      setShowCongrats(true); // Tebrikler mesajını göster
      setTimeout(() => {
        setShowCongrats(false); // Tebrikler mesajını gizle
        handleLevelUp(); // Seviye atlama
      }, 3000); // 3 saniye sonra bir sonraki seviyeye geçiş
    } else {
      // Yanlış topa tıklanırsa her iki top kaybolacak
      setBallVisible(false); // Her iki topu kaybettir
      setGameOver(true); // Oyun bitişi
      setTimeout(() => {
        alert("Yandınız! Level 1'e geri dönüyorsunuz.");
        restartGame(); // Oyun sıfırlanacak
      }, 3000); // 3 saniye sonra oyun başlatılacak
    }
  };

  // Seviye atlama işlemi
  const handleLevelUp = () => {
    setLevel(level + 1); // Seviye artır
    setBallClicked(0); // Tıklama sayısını sıfırla
    setBallVisible(true); // Yeni topu göster

    // Seviye arttıkça hız artacak
    const newSpeed = speed - (100 + level * 20); // Her seviyede hız artacak (daha fazla hız artışı)
    setSpeed(newSpeed);

    // 4. seviyeden sonra doğru ve yanlış top ekleme
    if (level >= 4) {
      const correctBallPosition = Math.floor(Math.random() * 2); // 0 veya 1, birini doğru, diğerini yanlış yap
      const newBallPositions = [
        { top: Math.floor(Math.random() * 95), left: Math.floor(Math.random() * 95), isCorrect: correctBallPosition === 0 },
        { top: Math.floor(Math.random() * 95), left: Math.floor(Math.random() * 95), isCorrect: correctBallPosition === 1 },
      ];
      setBallPositions(newBallPositions);
      setCorrectBall(correctBallPosition); // Correct ball track
    } else {
      setBallPositions([{ top: Math.floor(Math.random() * 95), left: Math.floor(Math.random() * 95), isCorrect: true }]); // Tek top
    }

    // 3 saniye sonra seviyeyi göster
    setShowLevelText(true);
    setTimeout(() => {
      setShowLevelText(false);
      setBallPositions([{ top: Math.floor(Math.random() * 95), left: Math.floor(Math.random() * 95), isCorrect: true }]); // Yeni topu seviyeye koy
    }, 3000); // 3 saniye sonra topu göstermek için

    if (level === 30) {
      setGameOver(true); // Eğer 30. seviyeye gelirse oyun biter
    }
  };

  // Oyunu başlatma
  const startGame = () => {
    setLevel(1);
    setBallPositions([{ top: Math.floor(Math.random() * 95), left: Math.floor(Math.random() * 95), isCorrect: true }]);
    setGameOver(false);
    setIsPlaying(true);
  };

  // Yeniden başlatma
  const restartGame = () => {
    setLevel(1);
    setBallPositions([{ top: Math.floor(Math.random() * 95), left: Math.floor(Math.random() * 95), isCorrect: true }]);
    setGameOver(false);
    setIsPlaying(true);
  };

  // Rastgele top rengi seçme
  const getBallColor = (isCorrect) => {
    return isCorrect ? '#28a745' : '#ff6347'; // Doğru top yeşil, yanlış top kırmızı
  };

  return (
    <View style={styles.container}>
      {showIntro && (
        <Animated.View style={[styles.welcomeScreen, { transform: [{ scale: scaleValue }] }]}>
          <Text style={styles.title}>SinirliTop</Text>
        </Animated.View>
      )}

      {!showIntro && !isPlaying && !gameOver && (
        <View style={styles.welcomeScreen}>
          <Text style={styles.title}>Yüksek Skor Yarışı</Text>
          <Text style={styles.instructions}>Topa tıklayarak durdurun! Her seviyede hızlanacak!</Text>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>Oyuna Başla</Text>
          </TouchableOpacity>
        </View>
      )}

      {isPlaying && !gameOver && (
        <View style={styles.gameScreen}>
          {showLevelText && <Text style={styles.level}>Level {level}</Text>}
          {showCongrats && <Text style={styles.congrats}>Tebrikler!</Text>}

          {!showCongrats && (
            <Text style={styles.levelInfo}>Seviye: {level}</Text>
          )}

          {ballPositions.map((position, index) => (
            <Animated.View
              key={index}
              style={[
                styles.ball,
                {
                  top: `${position.top}%`,
                  left: `${position.left}%`,
                  backgroundColor: getBallColor(position.isCorrect),
                  opacity: ballVisible ? 1 : 0, // Top sadece tıklanabilirken görünür
                },
              ]}
            >
              <TouchableOpacity onPress={() => handleBallClick(position.isCorrect)}>
                <Text style={styles.ballText}>Topa Tıkla!</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      )}

      {gameOver && (
        <View style={styles.gameOverScreen}>
          <Text style={styles.gameOverText}>Oyun Bitti!</Text>
          <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
            <Text style={styles.restartButtonText}>Yeniden Oyna</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  welcomeScreen: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  instructions: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  gameScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ball: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ballText: {
    color: '#fff',
    fontSize: 12,
  },
  level: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  levelInfo: {
    fontSize: 20,
    marginTop: 20,
  },
  congrats: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
  },
  gameOverScreen: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ff6347',
  },
  restartButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});
