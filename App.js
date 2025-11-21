import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableWithoutFeedback,
} from "react-native";
import { Accelerometer } from "expo-sensors";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;

const BULLET_WIDTH = 10;
const BULLET_HEIGHT = 20;

const BLOCK_WIDTH = 40;
const BLOCK_HEIGHT = 40;

function isColliding(a, b) {
  return (
    a.x < b.x + BLOCK_WIDTH &&
    a.x + BULLET_WIDTH > b.x &&
    a.y < b.y + BLOCK_HEIGHT &&
    a.y + BULLET_HEIGHT > b.y
  );
}

export default function App() {
  const [playerX, setPlayerX] = useState((screenWidth - PLAYER_WIDTH) / 2);
  const [bullets, setBullets] = useState([]);
  const [fallingBlocks, setFallingBlocks] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener(({ x }) => {
      const move = x * 30;
      setPlayerX((pervX) => {
        const nextX = pervX + move;
        return Math.max(0, Math.min(screenWidth - PLAYER_WIDTH, nextX));
      });
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    let interval = setInterval(() => {
      setBullets((prevBullets) =>
        prevBullets
          .map((b) => ({ ...b, y: b.y - 15 }))
          .filter((b) => b.y + 20 > 0)
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const block = {
        id: Date.now(),
        x: Math.random() * (screenWidth - PLAYER_WIDTH),
        y: -50,
      };

      setFallingBlocks((prev) => [...prev, block]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFallingBlocks((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y + 5 }))
          .filter((block) => {
            const hit = bullets.some((bullet) => isColliding(bullet, block));

            if (hit) {
              setBullets((prev) => prev.filter((b) => !isColliding(b, block)));
              return false;
            }
            const playerBox = {
              x: playerX,
              y: screenHeight - PLAYER_HEIGHT - 20,
              width: PLAYER_WIDTH,
              height: PLAYER_HEIGHT,
            };

            if (isColliding(block, playerBox)) {
              setGameOver(true);
              return false;
            }

            return block.y < screenHeight + 50;
          })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [bullets, playerX]);

  const handleBullets = () => {
    const newBullet = {
      id: Date.now(),
      x: playerX + PLAYER_WIDTH / 2 - BULLET_WIDTH,
      y: screenHeight - PLAYER_HEIGHT - BULLET_HEIGHT * 2,
    };
    setBullets((prev) => [...prev, newBullet]);
  };

  if (gameOver) {
    return (
      <View style={styles.container}>
        <Text style={styles.gameOverText}>Game Over</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={handleBullets}>
      <View style={styles.container}>
        {fallingBlocks.map((block) => (
          <View
            key={block.id}
            style={[
              styles.fallingBlock,
              {
                top: block.y,
                left: block.x,
              },
            ]}
          />
        ))}
        {bullets.map((b) => (
          <View
            key={b.id}
            style={[
              styles.bullet,
              {
                left: b.x,
                top: b.y,
              },
            ]}
          />
        ))}
        <View style={[styles.player, { left: playerX }]} />
        <Text style={styles.instruction}>Tilt your phone to move</Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0f1f",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 60,
  },

  player: {
    position: "absolute",
    bottom: 20,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    backgroundColor: "#00eaff",
    borderRadius: 12,
    shadowColor: "#00eaff",
    shadowOpacity: 0.8,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
  },

  bullet: {
    position: "absolute",
    width: BULLET_WIDTH,
    height: BULLET_HEIGHT,
    backgroundColor: "#ff007f",
    borderRadius: 5,
    shadowColor: "#ff007f",
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },

  fallingBlock: {
    position: "absolute",
    width: BLOCK_WIDTH,
    height: BLOCK_HEIGHT,
    backgroundColor: "#ffcb05",
    borderRadius: 6,
    shadowColor: "#ffcb05",
    shadowOpacity: 0.9,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
  },

  instruction: {
    position: "absolute",
    top: 70,
    color: "#7dd3fc",
    fontFamily: "Courier",
    fontSize: 16,
    textShadowColor: "#00eaff",
    textShadowRadius: 10,
  },

  gameOverText: {
    position: "absolute",
    top: screenHeight / 2 - 60,
    color: "#ff4d4d",
    fontSize: 40,
    fontWeight: "bold",
    textShadowColor: "#ff1a1a",
    textShadowRadius: 20,
  },
});
