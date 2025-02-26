import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const IdentificationScreen = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/background-image.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.instructionText}>Touch to identify</Text>

        <Image source={require("../assets/arrow.png")} style={styles.arrow} />

        {/* Camera Button */}
        <TouchableOpacity style={styles.cameraButton} onPress={handleCamera}>
          <Image
            source={require("../assets/camera-icon.png")}
            style={styles.cameraIcon}
          />
        </TouchableOpacity>

        {/* Gallery Button */}
        <View style={styles.galleryContainer}>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={handleGallery}
          >
            <Image
              source={require("../assets/gallery-icon.png")}
              style={styles.galleryIcon}
            />
          </TouchableOpacity>
          <Text style={styles.galleryText}>Gallery</Text>
        </View>

        {/* Display selected image */}
        {selectedImage && (
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  instructionText: {
    fontSize: 18,
    color: "#333",
    position: "absolute",
    top: "25%",
    fontWeight: "bold",
  },
  arrow: {
    position: "absolute",
    top: "30%",
    left: "30%",
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  cameraButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#8BC34A",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  cameraIcon: {
    width: 60,
    height: 60,
  },
  galleryContainer: {
    position: "absolute",
    left: "25%",
    bottom: "22%",
    alignItems: "center",
  },
  galleryButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  galleryIcon: {
    width: 30,
    height: 30,
  },
  galleryText: {
    marginTop: 5,
    fontSize: 18,
    color: "#333",
  },
  imagePreview: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 10,
  },
});

export default IdentificationScreen;
