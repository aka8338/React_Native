import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";
import { useOffline } from "../contexts/OfflineContext";
import ScreenWithFooter from "../components/ScreenWithFooter";
import { MaterialIcons } from "@expo/vector-icons";

const DiseaseReportScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { isOnline, queueDiseaseReport } = useOffline();
  
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
          "Permission to access location was denied"
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
        const locationString = `${address.district || ''} ${address.city || ''}, ${address.region || ''}, ${address.country || ''}`;
        setLocation(locationString.trim());
      }
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get current location");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Submit the report
  const handleSubmit = async () => {
    if (!diseaseName) {
      Alert.alert("Error", "Please enter a disease name");
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
      };

      // Use the offline context to queue the report
      await queueDiseaseReport(report);

      // Show success message
      Alert.alert(
        "Success",
        isOnline
          ? t("reporting.submissionSuccess")
          : t("offline.syncWhenOnline"),
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Home"),
          },
        ]
      );
    } catch (error) {
      console.error("Error submitting report:", error);
      Alert.alert(
        "Error",
        t("reporting.submissionFailed"),
        [
          {
            text: t("reporting.tryAgain"),
            onPress: () => handleSubmit(),
          },
          {
            text: t("general.cancel"),
            style: "cancel",
          },
        ]
      );
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
            <Text style={styles.headerTitle}>{t("reporting.reportDisease")}</Text>
            {!isOnline && (
              <View style={styles.offlineIndicator}>
                <MaterialIcons name="cloud-off" size={16} color="#fff" />
                <Text style={styles.offlineText}>{t("offline.offlineMode")}</Text>
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

          {/* Severity */}
          <Text style={styles.label}>{t("reporting.severity")}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={severity}
              onValueChange={(itemValue) => setSeverity(itemValue)}
              style={styles.picker}
            >
              <Picker.Item
                label={t("reporting.mild")}
                value="mild"
              />
              <Picker.Item
                label={t("reporting.moderate")}
                value="moderate"
              />
              <Picker.Item
                label={t("reporting.severe")}
                value="severe"
              />
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
              <Picker.Item
                label={t("reporting.youngTree")}
                value="youngTree"
              />
              <Picker.Item
                label={t("reporting.matureTree")}
                value="matureTree"
              />
              <Picker.Item
                label={t("reporting.oldTree")}
                value="oldTree"
              />
            </Picker>
          </View>

          {/* Location */}
          <View style={styles.locationContainer}>
            <Text style={styles.label}>{t("reporting.location")}</Text>
            <TouchableOpacity
              style={styles.locationRefresh}
              onPress={getCurrentLocation}
              disabled={isLoadingLocation}
            >
              <MaterialIcons name="my-location" size={24} color="#148F55" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder={t("reporting.location")}
          />
          {isLoadingLocation && (
            <ActivityIndicator
              size="small"
              color="#148F55"
              style={styles.locationLoader}
            />
          )}

          {/* Weather Conditions */}
          <Text style={styles.label}>{t("reporting.weatherConditions")}</Text>
          <TextInput
            style={styles.input}
            value={weather}
            onChangeText={setWeather}
            placeholder={t("reporting.weatherConditions")}
          />

          {/* Notes */}
          <Text style={styles.label}>{t("reporting.additionalNotes")}</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder={t("reporting.additionalNotes")}
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
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>{t("general.submit")}</Text>
            )}
          </TouchableOpacity>
          
          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>{t("general.cancel")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWithFooter>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  offlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  offlineText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 12,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  notesInput: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  locationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationRefresh: {
    padding: 8,
  },
  locationLoader: {
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: "#148F55",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginVertical: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 30,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default DiseaseReportScreen; 