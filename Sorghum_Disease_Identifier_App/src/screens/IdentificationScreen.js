import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { MaterialIcons } from "@expo/vector-icons";
import ScreenWithFooter from "../components/ScreenWithFooter";
import { useOffline } from "../contexts/OfflineContext";

const IdentificationScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { isOnline, saveIdentificationResult } = useOffline();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [identificationResult, setIdentificationResult] = useState(null);

  const handleCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setIdentificationResult(null); // Reset previous results
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
      setIdentificationResult(null); // Reset previous results
    }
  };

  const handleIdentify = async () => {
    if (!selectedImage) {
      Alert.alert("Error", t("identification.noImageSelected"));
      return;
    }

    setIsAnalyzing(true);

    try {
      // Mock identification process - in a real app, this would be an API call to a ML model
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing time

      // Mock result - this would come from the backend in a real app
      const mockResult = {
        disease: "Anthracnose",
        confidence: 0.92,
        date: new Date().toISOString(),
        imageUri: selectedImage
      };

      setIdentificationResult(mockResult);

      // Save the result using the offline context
      if (mockResult) {
        await saveIdentificationResult(mockResult);
      }
    } catch (error) {
      console.error("Error during identification:", error);
      Alert.alert("Error", t("identification.identificationFailed"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReportDisease = () => {
    if (identificationResult) {
      navigation.navigate("DiseaseReport", {
        identificationData: identificationResult,
        imageUri: selectedImage
      });
    }
  };

  return (
    <ScreenWithFooter navigation={navigation}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <ImageBackground
          source={require("../assets/background-image.png")}
          style={styles.background}
        >
          <View style={styles.container}>
            {!identificationResult ? (
              // Image capture UI
              <>
                <Text style={styles.instructionText}>{t("identification.touchToIdentify")}</Text>

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
                  <Text style={styles.galleryText}>{t("identification.gallery")}</Text>
                </View>

                {/* Display selected image and identify button */}
                {selectedImage && (
                  <View style={styles.selectedImageContainer}>
                    <Image source={{ uri: selectedImage }} style={styles.imagePreview} />

                    <TouchableOpacity
                      style={styles.identifyButton}
                      onPress={handleIdentify}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <Text style={styles.identifyButtonText}>
                          {t("identification.analyze")}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Loading indicator */}
                {isAnalyzing && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#8BC34A" />
                    <Text style={styles.loadingText}>
                      {t("identification.analyzing")}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              // Results UI
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>{t("identification.results")}</Text>
                
                <View style={styles.resultImageContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.resultImage} />
                </View>

                <View style={styles.diseaseInfoContainer}>
                  <Text style={styles.diseaseName}>{identificationResult.disease}</Text>
                  
                  <View style={styles.confidenceContainer}>
                    <Text style={styles.confidenceLabel}>{t("diseases.confidence")}: </Text>
                    <Text style={styles.confidenceValue}>
                      {Math.round(identificationResult.confidence * 100)}%
                    </Text>
                  </View>

                  <View style={styles.divider} />
                  
                  <Text style={styles.treatmentTitle}>{t("diseases.treatment")}</Text>
                  <View style={styles.treatmentItem}>
                    <MaterialIcons name="check-circle" size={20} color="#148F55" />
                    <Text style={styles.treatmentText}>Apply fungicides during flowering period</Text>
                  </View>
                  <View style={styles.treatmentItem}>
                    <MaterialIcons name="check-circle" size={20} color="#148F55" />
                    <Text style={styles.treatmentText}>Prune infected branches and leaves</Text>
                  </View>
                  <View style={styles.treatmentItem}>
                    <MaterialIcons name="check-circle" size={20} color="#148F55" />
                    <Text style={styles.treatmentText}>Maintain proper tree spacing</Text>
                  </View>
                </View>

                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setIdentificationResult(null)}
                  >
                    <MaterialIcons name="refresh" size={24} color="#333" />
                    <Text style={styles.actionButtonText}>{t("identification.newScan")}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleReportDisease}
                  >
                    <MaterialIcons name="flag" size={24} color="#333" />
                    <Text style={styles.actionButtonText}>{t("identification.reportDisease")}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate("Mango Disease")}
                  >
                    <MaterialIcons name="info" size={24} color="#333" />
                    <Text style={styles.actionButtonText}>{t("diseases.learnMore")}</Text>
                  </TouchableOpacity>
                </View>

                {!isOnline && (
                  <View style={styles.offlineIndicator}>
                    <MaterialIcons name="cloud-off" size={16} color="#fff" />
                    <Text style={styles.offlineText}>{t("offline.offlineMode")}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ImageBackground>
      </ScrollView>
    </ScreenWithFooter>
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
    padding: 16,
  },
  instructionText: {
    fontSize: 18,
    color: "#333",
    position: "absolute",
    top: "20%",
    fontWeight: "bold",
  },
  arrow: {
    position: "absolute",
    top: "25%",
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
  selectedImageContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  identifyButton: {
    backgroundColor: "#148F55",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    width: 200,
    alignItems: "center",
  },
  identifyButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },
  resultsContainer: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  resultImageContainer: {
    marginBottom: 20,
  },
  resultImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  diseaseInfoContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  diseaseName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  confidenceLabel: {
    fontSize: 16,
    color: "#666",
  },
  confidenceValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#148F55",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    width: "100%",
    marginVertical: 15,
  },
  treatmentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  treatmentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  treatmentText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 10,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10,
    flexWrap: "wrap",
  },
  actionButton: {
    alignItems: "center",
    marginHorizontal: 5,
    marginBottom: 15,
    width: 90,
  },
  actionButtonText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
    marginTop: 5,
  },
  offlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginTop: 10,
  },
  offlineText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 12,
  },
});

export default IdentificationScreen;
