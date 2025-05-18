import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenWithFooter from "../components/ScreenWithFooter";
import { useOffline } from "../contexts/OfflineContext";
import { useNavigation } from '@react-navigation/native';

const DiseaseReportScreen = ({ route }) => {
  const { t } = useTranslation();
  const { isOnline, queueDiseaseReport } = useOffline();
  const navigation = useNavigation();

  // Get identification data if passed from previous screen
  const identificationData = route.params?.identificationData || null;
  const imageUri = route.params?.imageUri || null;

  // Form state
  const [location, setLocation] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [notes, setNotes] = useState("");
  const [severity, setSeverity] = useState("moderate");
  const [treeAge, setTreeAge] = useState("matureTree");
  const [weather, setWeather] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [diseaseName, setDiseaseName] = useState(
    identificationData ? identificationData.disease : ""
  );

  // Extract symptoms and recommendations from identification data if available
  const symptoms = identificationData?.symptoms || [];
  const recommendations = identificationData?.recommendations || [];

  // Get current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Get current location using expo-location
  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to report disease location."
        );
        setIsLoadingLocation(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setCoordinates({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      // Reverse geocode to get human-readable address
      const [address] = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (address) {
        const locationString = `${address.district || ""} ${
          address.city || ""
        }, ${address.region || ""}, ${address.country || ""}`;
        setLocation(locationString.trim());
      }
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Location Error", "Could not get your current location.");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Submit the report
  const handleSubmit = async () => {
    if (!diseaseName || !severity) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the report object
      const report = {
        diseaseName,
        severity,
        treeAge,
        location,
        coordinates,
        weather,
        notes,
        date: new Date().toISOString(),
        imageUri,
        identificationData,
        symptoms,
        recommendations,
      };

      // Use the offline context to queue the report
      await queueDiseaseReport(report);

      // Show success message
      Alert.alert(
        "Success",
        isOnline
          ? "Report submitted successfully!"
          : "Report saved offline and will be synced when online.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Home"),
          },
        ]
      );
    } catch (error) {
      console.error("Error submitting report:", error);
      Alert.alert("Error", "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWithFooter navigation={navigation}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {t("reporting.reportDisease")}
            </Text>
            {!isOnline && (
              <View style={styles.offlineIndicator}>
                <Text style={styles.offlineText}>
                  {t("offline.offlineMode")}
                </Text>
              </View>
            )}
          </View>

          {/* Image Preview */}
          {imageUri && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.image} />
            </View>
          )}

          {/* Disease Name */}
          <Text style={styles.label}>{t("diseases.name")}</Text>
          <TextInput
            style={styles.input}
            value={diseaseName}
            onChangeText={setDiseaseName}
            placeholder={t("diseases.name")}
          />

          {/* Symptoms Section */}
          {symptoms && symptoms.length > 0 && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>{t("diseases.symptoms")}</Text>
              {symptoms.map((symptom, index) => (
                <View key={`symptom-${index}`} style={styles.bulletItem}>
                  <MaterialIcons
                    name="brightness-1"
                    size={8}
                    color="#666"
                    style={styles.bullet}
                  />
                  <Text style={styles.bulletText}>{symptom}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Recommendations Section */}
          {recommendations && recommendations.length > 0 && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>{t("diseases.treatment")}</Text>
              {recommendations.map((recommendation, index) => (
                <View key={`rec-${index}`} style={styles.bulletItem}>
                  <MaterialIcons
                    name="brightness-1"
                    size={8}
                    color="#666"
                    style={styles.bullet}
                  />
                  <Text style={styles.bulletText}>{recommendation}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Severity */}
          <Text style={styles.label}>{t("reporting.severity")}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={severity}
              onValueChange={(itemValue) => setSeverity(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label={t("reporting.mild")} value="mild" />
              <Picker.Item label={t("reporting.moderate")} value="moderate" />
              <Picker.Item label={t("reporting.severe")} value="severe" />
            </Picker>
          </View>

          {/* Tree Age */}
          <Text style={styles.label}>{t("reporting.treeAge")}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={treeAge}
              onValueChange={(itemValue) => setTreeAge(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label={t("reporting.youngTree")} value="youngTree" />
              <Picker.Item
                label={t("reporting.matureTree")}
                value="matureTree"
              />
              <Picker.Item label={t("reporting.oldTree")} value="oldTree" />
            </Picker>
          </View>

          {/* Weather Conditions */}
          <Text style={styles.label}>{t("reporting.weather")}</Text>
          <TextInput
            style={styles.input}
            value={weather}
            onChangeText={setWeather}
            placeholder={t("reporting.weatherPlaceholder")}
          />

          {/* Location */}
          <Text style={styles.label}>{t("reporting.location")}</Text>
          <View style={styles.locationContainer}>
            <TextInput
              style={[styles.input, styles.locationInput]}
              value={location}
              onChangeText={setLocation}
              placeholder={t("reporting.locationPlaceholder")}
            />
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
            >
              {isLoadingLocation ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.locationButtonText}>
                  {t("reporting.useCurrentLocation")}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Additional Notes */}
          <Text style={styles.label}>{t("reporting.notes")}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder={t("reporting.notesPlaceholder")}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {t("reporting.submit")}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWithFooter>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
  },
  pickerContainer: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  locationContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  locationInput: {
    flex: 1,
    marginBottom: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  locationButton: {
    backgroundColor: "#148F55",
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  locationButtonText: {
    color: "#FFF",
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: "#148F55",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  offlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  offlineText: {
    color: "#FFF",
    marginLeft: 5,
    fontSize: 12,
  },
  infoSection: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  bullet: {
    marginTop: 6,
    marginRight: 6,
  },
  bulletText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
});

export default DiseaseReportScreen;
