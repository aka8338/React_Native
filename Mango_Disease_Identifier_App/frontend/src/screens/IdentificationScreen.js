import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenWithFooter from "../components/ScreenWithFooter";
import { useOffline } from "../contexts/OfflineContext";
import { DiseaseService } from "../services/api";

const IdentificationScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { isOnline, saveIdentificationResult } = useOffline();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [identificationResult, setIdentificationResult] = useState(null);

  const handleCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
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
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setIdentificationResult(null); // Reset previous results
    }
  };

  const resetScan = () => {
    // Reset all states to initial values
    setSelectedImage(null);
    setIdentificationResult(null);
    setIsAnalyzing(false);
  };

  const handleIdentify = async () => {
    if (!selectedImage) {
      Alert.alert("Error", t("identification.noImageSelected"));
      return;
    }

    setIsAnalyzing(true);

    try {
      // Send the image to the backend for disease identification
      if (!isOnline) {
        throw new Error(
          "You are offline. Please connect to the internet to identify diseases."
        );
      }

      const result = await DiseaseService.identifyDisease(selectedImage);
      console.log("Result from disease identification:", result);

      // Transform the API response to match our app's data structure
      // Now handling the enhanced backend response
      const identificationData = {
        // Use the most specific disease name available
        disease:
          result.disease_name ||
          result.disease ||
          result.class ||
          result.prediction ||
          "Unknown",
        // Use the provided probability or confidence
        confidence: result.probability || 0.75, // Default if missing
        date: new Date().toISOString(),
        imageUri: selectedImage,
        // Use the symptoms and recommendations from the backend if available
        symptoms: result.symptoms || [],
        recommendations: result.recommendations || [],
        // Store the raw response for reference
        rawResponse: result,
      };

      console.log("Transformed identification data:", identificationData);
      setIdentificationResult(identificationData);

      // Save the result using the offline context
      await saveIdentificationResult(identificationData);
    } catch (error) {
      console.error("Error during identification:", error);

      let errorMessage = t("identification.identificationFailed");

      // If the error is from the server and contains a message, display it
      if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReportDisease = () => {
    if (identificationResult) {
      navigation.navigate("DiseaseReport", {
        identificationData: identificationResult,
        imageUri: selectedImage,
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
                <Text style={styles.instructionText}>
                  {t("identification.touchToIdentify")}
                </Text>

                <Image
                  source={require("../assets/arrow.png")}
                  style={styles.arrow}
                />

                {/* Camera Button */}
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={handleCamera}
                >
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
                  <Text style={styles.galleryText}>
                    {t("identification.gallery")}
                  </Text>
                </View>

                {/* Display selected image and identify button */}
                {selectedImage && (
                  <View style={styles.selectedImageContainer}>
                    <Image
                      source={{ uri: selectedImage }}
                      style={styles.imagePreview}
                    />

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
                <Text style={styles.resultsTitle}>
                  {t("identification.results")}
                </Text>

                <View style={styles.resultImageContainer}>
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.resultImage}
                  />
                </View>

                <View style={styles.diseaseInfoContainer}>
                  <Text style={styles.diseaseName}>
                    {identificationResult.disease}
                  </Text>

                  <View style={styles.confidenceContainer}>
                    <Text style={styles.confidenceLabel}>
                      {t("diseases.confidence")}:{" "}
                    </Text>
                    <Text style={styles.confidenceValue}>
                      {Math.round(identificationResult.confidence * 100)}%
                    </Text>
                  </View>

                  <View style={styles.divider} />

                  {/* Symptoms Section */}
                  <Text style={styles.treatmentTitle}>
                    {t("diseases.symptoms")}
                  </Text>
                  {identificationResult.symptoms &&
                  identificationResult.symptoms.length > 0 ? (
                    identificationResult.symptoms.map((symptom, index) => (
                      <View
                        key={`symptom-${index}`}
                        style={styles.treatmentItem}
                      >
                        <MaterialIcons
                          name="warning"
                          size={20}
                          color="#ff8c00"
                        />
                        <Text style={styles.treatmentText}>{symptom}</Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.treatmentItem}>
                      <MaterialIcons name="warning" size={20} color="#ff8c00" />
                      <Text style={styles.treatmentText}>
                        {t("identification.noSymptomsAvailable")}
                      </Text>
                    </View>
                  )}

                  <View style={styles.divider} />

                  {/* Recommendations Section */}
                  <Text style={styles.treatmentTitle}>
                    {t("diseases.treatment")}
                  </Text>
                  {identificationResult.recommendations &&
                  identificationResult.recommendations.length > 0 ? (
                    identificationResult.recommendations.map(
                      (recommendation, index) => (
                        <View key={`rec-${index}`} style={styles.treatmentItem}>
                          <MaterialIcons
                            name="check-circle"
                            size={20}
                            color="#148F55"
                          />
                          <Text style={styles.treatmentText}>
                            {recommendation}
                          </Text>
                        </View>
                      )
                    )
                  ) : (
                    <>
                      <View style={styles.treatmentItem}>
                        <MaterialIcons
                          name="check-circle"
                          size={20}
                          color="#148F55"
                        />
                        <Text style={styles.treatmentText}>
                          {t("identification.treatment1")}
                        </Text>
                      </View>
                      <View style={styles.treatmentItem}>
                        <MaterialIcons
                          name="check-circle"
                          size={20}
                          color="#148F55"
                        />
                        <Text style={styles.treatmentText}>
                          {t("identification.treatment2")}
                        </Text>
                      </View>
                      <View style={styles.treatmentItem}>
                        <MaterialIcons
                          name="check-circle"
                          size={20}
                          color="#148F55"
                        />
                        <Text style={styles.treatmentText}>
                          {t("identification.treatment3")}
                        </Text>
                      </View>
                    </>
                  )}
                </View>

                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={resetScan}
                  >
                    <MaterialIcons name="refresh" size={24} color="#333" />
                    <Text style={styles.actionButtonText}>
                      {t("identification.newScan")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleReportDisease}
                  >
                    <MaterialIcons name="flag" size={24} color="#333" />
                    <Text style={styles.actionButtonText}>
                      {t("identification.reportDisease")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate("Mango Disease")}
                  >
                    <MaterialIcons name="info" size={24} color="#333" />
                    <Text style={styles.actionButtonText}>
                      {t("diseases.learnMore")}
                    </Text>
                  </TouchableOpacity>
                </View>

                {!isOnline && (
                  <View style={styles.offlineIndicator}>
                    <MaterialIcons name="cloud-off" size={16} color="#fff" />
                    <Text style={styles.offlineText}>
                      {t("offline.offlineMode")}
                    </Text>
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
