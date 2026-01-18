import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { VideoView, useVideoPlayer } from 'expo-video';  // Use useVideoPlayer hook
import { useNavigation } from "@react-navigation/native";

const screenHeight = Dimensions.get("window").height;

export default function MainScreen() {
  const navigation = useNavigation();

  // Use the useVideoPlayer hook to create and manage the player
  const player = useVideoPlayer(require("./assets/hairvideo.mp4"));

  useEffect(() => {
    if (player) {
      // Configure the player for looping, muting, and auto-play
      player.loop = true;  // Enable looping
      player.muted = true;  // Mute the video
      player.play();  // Start playback
    }

    // Optional: Cleanup on unmount (pauses the player)
    return () => {
      if (player) {
        player.pause();
      }
    };
  }, [player]);

  return (
    <View style={styles.container}>
      {/* Video Section */}
      <View style={styles.videoContainer}>
        <VideoView
          player={player}  // Pass the player instance here
          style={styles.backgroundVideo}
          resizeMode="cover"
        />
      </View>

      {/* White Bottom Card */}
      <View style={styles.bottomCard}>
        <Text style={styles.loginText}>Login as</Text>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.buttonText}>User</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => navigation.navigate("AdminLogin")}
        >
          <Text style={styles.buttonText}>Admin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  videoContainer: {
    height: 700,
    width: 418,
  //  marginRight: 300,
  }, 
  backgroundVideo: {
    width: "295%",
    height: "100%",
    marginLeft: 0,
   // alignItems: "center",
  },
  bottomCard: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: -screenHeight * 0.04,
    marginHorizontal: 10,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingHorizontal: 40,
    paddingTop: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 9,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: "#744C80",
  },
  loginButton: {
    backgroundColor: "#744C80",
    borderRadius: 8,
    paddingVertical: 12,
    width: "80%",
    alignItems: "center",
    marginBottom: 20,
  },
  adminButton: {
    backgroundColor: "#744C80",
    borderRadius: 8,
    paddingVertical: 12,
    width: "80%",
    alignItems: "center",
    marginBottom: 40,
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  loginText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#744C80",
    marginBottom: 20,
  },
});
