import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  ImageBackground,
} from "react-native";
import { useTranslation } from "react-i18next";
import ScreenWithFooter from "../components/ScreenWithFooter";
import { MaterialIcons } from "@expo/vector-icons";

const MangoDiseasesScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const diseases = [
    {
      id: 1,
      name: t("diseases.anthracnose"),
      image: require("../assets/diseases/anthracnose.jpg"),
      description: t("diseases.anthracnoseDesc"),
      symptoms: [
        t("diseases.anthracnoseSymptom1"),
        t("diseases.anthracnoseSymptom2"),
        t("diseases.anthracnoseSymptom3"),
        t("diseases.anthracnoseSymptom4")
      ],
      treatment: [
        t("diseases.anthracnoseTreatment1"),
        t("diseases.anthracnoseTreatment2"),
        t("diseases.anthracnoseTreatment3"),
        t("diseases.anthracnoseTreatment4")
      ]
    },
    {
      id: 2,
      name: t("diseases.powderyMildew"),
      image: require("../assets/diseases/powdery_mildew.jpg"),
      description: t("diseases.powderyMildewDesc"),
      symptoms: [
        t("diseases.powderyMildewSymptom1"),
        t("diseases.powderyMildewSymptom2"),
        t("diseases.powderyMildewSymptom3"),
        t("diseases.powderyMildewSymptom4")
      ],
      treatment: [
        t("diseases.powderyMildewTreatment1"),
        t("diseases.powderyMildewTreatment2"),
        t("diseases.powderyMildewTreatment3"),
        t("diseases.powderyMildewTreatment4")
      ]
    },
    {
      id: 3,
      name: t("diseases.blackSpot"),
      image: require("../assets/diseases/anthracnose.jpg"),
      description: t("diseases.blackSpotDesc"),
      symptoms: [
        t("diseases.blackSpotSymptom1"),
        t("diseases.blackSpotSymptom2"),
        t("diseases.blackSpotSymptom3"),
        t("diseases.blackSpotSymptom4")
      ],
      treatment: [
        t("diseases.blackSpotTreatment1"),
        t("diseases.blackSpotTreatment2"),
        t("diseases.blackSpotTreatment3"),
        t("diseases.blackSpotTreatment4")
      ]
    },
    {
      id: 4,
      name: t("diseases.stemEndRot"),
      image: require("../assets/diseases/powdery_mildew.jpg"),
      description: t("diseases.stemEndRotDesc"),
      symptoms: [
        t("diseases.stemEndRotSymptom1"),
        t("diseases.stemEndRotSymptom2"),
        t("diseases.stemEndRotSymptom3"),
        t("diseases.stemEndRotSymptom4")
      ],
      treatment: [
        t("diseases.stemEndRotTreatment1"),
        t("diseases.stemEndRotTreatment2"),
        t("diseases.stemEndRotTreatment3"),
        t("diseases.stemEndRotTreatment4")
      ]
    },
    {
      id: 5,
      name: t("diseases.bacterialCanker"),
      image: require("../assets/diseases/anthracnose.jpg"),
      description: t("diseases.bacterialCankerDesc"),
      symptoms: [
        t("diseases.bacterialCankerSymptom1"),
        t("diseases.bacterialCankerSymptom2"),
        t("diseases.bacterialCankerSymptom3"),
        t("diseases.bacterialCankerSymptom4")
      ],
      treatment: [
        t("diseases.bacterialCankerTreatment1"),
        t("diseases.bacterialCankerTreatment2"),
        t("diseases.bacterialCankerTreatment3"),
        t("diseases.bacterialCankerTreatment4")
      ]
    }
  ];

  const openDiseaseModal = (disease) => {
    setSelectedDisease(disease);
    setModalVisible(true);
  };

  const renderDiseaseCard = (disease) => {
    return (
      <TouchableOpacity
        key={disease.id}
        style={styles.diseaseCard}
        onPress={() => openDiseaseModal(disease)}
      >
        <Image source={disease.image} style={styles.diseaseImage} />
        <View style={styles.diseaseInfo}>
          <Text style={styles.diseaseName}>{disease.name}</Text>
          <Text style={styles.learnMore}>{t("diseases.learnMore")} →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWithFooter navigation={navigation}>
      <ImageBackground
        source={require("../assets/background-light.png")}
        style={styles.background}
      >
        <View style={styles.container}>
          <Text style={styles.screenTitle}>{t("general.mangoDisease")}</Text>
          <Text style={styles.screenSubtitle}>
            {t("diseases.commonDiseases")}
          </Text>

          <ScrollView style={styles.diseasesContainer}>
            {diseases.map(renderDiseaseCard)}
          </ScrollView>

          {/* Disease Detail Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                {selectedDisease && (
                  <>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <MaterialIcons name="close" size={24} color="#333" />
                    </TouchableOpacity>

                    <ScrollView style={styles.modalScrollView}>
                      <Text style={styles.modalTitle}>
                        {selectedDisease.name}
                      </Text>
                      <Image
                        source={selectedDisease.image}
                        style={styles.modalImage}
                      />
                      <Text style={styles.descriptionTitle}>
                        {t("diseases.description")}
                      </Text>
                      <Text style={styles.descriptionText}>
                        {selectedDisease.description}
                      </Text>

                      <Text style={styles.symptomsTitle}>
                        {t("diseases.symptoms")}
                      </Text>
                      {selectedDisease.symptoms.map((symptom, index) => (
                        <View key={index} style={styles.symptomItem}>
                          <View style={styles.bulletPoint} />
                          <Text style={styles.symptomText}>{symptom}</Text>
                        </View>
                      ))}

                      <Text style={styles.treatmentTitle}>
                        {t("diseases.treatment")}
                      </Text>
                      {selectedDisease.treatment.map((treatment, index) => (
                        <View key={index} style={styles.treatmentItem}>
                          <View style={styles.bulletPoint} />
                          <Text style={styles.treatmentText}>{treatment}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </>
                )}
              </View>
            </View>
          </Modal>
        </View>
      </ImageBackground>
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
    padding: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  screenSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  diseasesContainer: {
    flex: 1,
  },
  diseaseCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  diseaseImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  diseaseInfo: {
    padding: 16,
  },
  diseaseName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  learnMore: {
    fontSize: 14,
    color: "#148F55",
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    width: "100%",
    maxHeight: "80%",
    padding: 20,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 15,
    padding: 5,
  },
  modalScrollView: {
    marginTop: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
    resizeMode: "cover",
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 16,
  },
  symptomsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  symptomItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#148F55",
    marginTop: 6,
    marginRight: 8,
  },
  symptomText: {
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  treatmentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  treatmentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  treatmentText: {
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
});

export default MangoDiseasesScreen; 