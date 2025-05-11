import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import ScreenWithFooter from "../components/ScreenWithFooter";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useAuth } from "../contexts/AuthContext";
import { useOffline } from "../contexts/OfflineContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, logout, isLoading } = useAuth();
  const { isOnline, clearStoredData } = useOffline();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [activityHistoryVisible, setActivityHistoryVisible] = useState(false);
  const [savedReportsVisible, setSavedReportsVisible] = useState(false);
  const [userActivity, setUserActivity] = useState([]);
  const [savedReports, setSavedReports] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoadingData(true);
    try {
      // Load user activity
      const activityData = await AsyncStorage.getItem("userActivity");
      if (activityData) {
        const parsedData = JSON.parse(activityData);
        setUserActivity(parsedData);
      }

      // Load saved reports
      const reportData = await AsyncStorage.getItem("diseaseReports");
      if (reportData) {
        const parsedData = JSON.parse(reportData);
        setSavedReports(parsedData);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogout = async () => {
    if (!isOnline) {
      Alert.alert(
        t("profile.offlineLogoutWarning"),
        t("profile.offlineLogoutMessage"),
        [
          { text: t("general.cancel"), style: "cancel" },
          {
            text: t("profile.logout"),
            onPress: async () => {
              const result = await logout();
              if (!result.success) {
                Alert.alert("Error", result.error || "Logout failed");
              }
            },
            style: "destructive",
          },
        ]
      );
      return;
    }

    setLogoutConfirmVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutConfirmVisible(false);
    const result = await logout();
    if (!result.success) {
      Alert.alert("Error", result.error || "Logout failed");
    }
  };

  const handleClearData = () => {
    Alert.alert(t("profile.clearDataTitle"), t("profile.clearDataMessage"), [
      { text: t("general.cancel"), style: "cancel" },
      {
        text: t("profile.clearData"),
        onPress: async () => {
          await clearStoredData();
          // Also clear activity and reports from state
          setUserActivity([]);
          setSavedReports([]);
          Alert.alert("Success", t("profile.dataCleared"));
        },
        style: "destructive",
      },
    ]);
  };

  const ActivityHistoryModal = () => (
    <Modal
      visible={activityHistoryVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setActivityHistoryVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t("profile.activityHistory")}
            </Text>
            <TouchableOpacity onPress={() => setActivityHistoryVisible(false)}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {userActivity.length > 0 ? (
            <FlatList
              data={userActivity}
              keyExtractor={(item, index) => `activity-${index}`}
              renderItem={({ item }) => (
                <View style={styles.activityItem}>
                  <MaterialIcons
                    name={item.type === "identification" ? "search" : "report"}
                    size={24}
                    color="#148F55"
                  />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>{item.description}</Text>
                    <Text style={styles.activityDate}>
                      {new Date(item.date).toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}
              contentContainerStyle={styles.activityList}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="history" size={64} color="#CCCCCC" />
              <Text style={styles.emptyStateText}>
                {t("profile.noActivityYet")}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  const SavedReportsModal = () => (
    <Modal
      visible={savedReportsVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setSavedReportsVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t("profile.savedReports")}</Text>
            <TouchableOpacity onPress={() => setSavedReportsVisible(false)}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {savedReports.length > 0 ? (
            <FlatList
              data={savedReports}
              keyExtractor={(item, index) => `report-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.reportItem}
                  onPress={() => {
                    setSavedReportsVisible(false);
                    navigation.navigate("DiseaseReport", {
                      identificationData: item,
                    });
                  }}
                >
                  {item.imageUri && (
                    <Image
                      source={{ uri: item.imageUri }}
                      style={styles.reportImage}
                    />
                  )}
                  <View style={styles.reportContent}>
                    <Text style={styles.reportTitle}>{item.diseaseName}</Text>
                    <Text style={styles.reportDate}>
                      {new Date(item.date).toLocaleDateString()}
                    </Text>
                    <View
                      style={[
                        styles.severityBadge,
                        item.severity === "severe"
                          ? styles.severeBadge
                          : item.severity === "moderate"
                          ? styles.moderateBadge
                          : styles.mildBadge,
                      ]}
                    >
                      <Text style={styles.severityText}>
                        {t(`reporting.${item.severity}`)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.reportsList}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="folder-open" size={64} color="#CCCCCC" />
              <Text style={styles.emptyStateText}>
                {t("profile.noReportsYet")}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  if (!user) {
    return (
      <ScreenWithFooter navigation={navigation}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#148F55" />
        </View>
      </ScreenWithFooter>
    );
  }

  return (
    <ScreenWithFooter navigation={navigation}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t("profile.myProfile")}</Text>
          <LanguageSwitcher style={styles.languageSwitcher} />
        </View>

        <View style={styles.profileSection}>
          <Image
            source={require("../assets/profile-placeholder.png")}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>
              {t("profile.editProfile")}
            </Text>
          </TouchableOpacity>
        </View>

        {isLoadingData ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#148F55" />
          </View>
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{savedReports.length}</Text>
              <Text style={styles.statLabel}>{t("profile.reports")}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {
                  Object.keys(
                    savedReports.reduce((acc, report) => {
                      acc[report.diseaseName] = true;
                      return acc;
                    }, {})
                  ).length
                }
              </Text>
              <Text style={styles.statLabel}>{t("profile.diseases")}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userActivity.length}</Text>
              <Text style={styles.statLabel}>{t("profile.activities")}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("profile.accountSettings")}
          </Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setActivityHistoryVisible(true)}
          >
            <View style={styles.menuItemLeft}>
              <MaterialIcons name="history" size={24} color="#148F55" />
              <Text style={styles.menuItemText}>
                {t("profile.activityHistory")}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setSavedReportsVisible(true)}
          >
            <View style={styles.menuItemLeft}>
              <MaterialIcons name="report" size={24} color="#148F55" />
              <Text style={styles.menuItemText}>
                {t("profile.savedReports")}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("ReportsTab")}
          >
            <View style={styles.menuItemLeft}>
              <MaterialIcons name="analytics" size={24} color="#148F55" />
              <Text style={styles.menuItemText}>{t("profile.analytics")}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("profile.preferences")}</Text>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <MaterialIcons
                name="nightlight-round"
                size={24}
                color="#148F55"
              />
              <Text style={styles.menuItemText}>{t("profile.darkMode")}</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#ccc", true: "#a0d0ba" }}
              thumbColor={darkMode ? "#148F55" : "#f4f3f4"}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <MaterialIcons name="notifications" size={24} color="#148F55" />
              <Text style={styles.menuItemText}>
                {t("profile.notifications")}
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#ccc", true: "#a0d0ba" }}
              thumbColor={notifications ? "#148F55" : "#f4f3f4"}
            />
          </View>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <MaterialIcons name="language" size={24} color="#148F55" />
              <Text style={styles.menuItemText}>{t("profile.language")}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("profile.help")}</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <MaterialIcons name="help-outline" size={24} color="#148F55" />
              <Text style={styles.menuItemText}>{t("profile.about")}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <MaterialIcons name="privacy-tip" size={24} color="#148F55" />
              <Text style={styles.menuItemText}>
                {t("profile.privacyPolicy")}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleClearData}>
            <View style={styles.menuItemLeft}>
              <MaterialIcons name="delete-outline" size={24} color="#e74c3c" />
              <Text style={[styles.menuItemText, styles.dangerText]}>
                {t("profile.clearStoredData")}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>{t("profile.logout")}</Text>
        </TouchableOpacity>

        {/* Logout confirmation modal */}
        <Modal
          visible={logoutConfirmVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setLogoutConfirmVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.confirmModalContent}>
              <Text style={styles.confirmTitle}>
                {t("profile.confirmLogout")}
              </Text>
              <Text style={styles.confirmText}>
                {t("profile.logoutConfirmMessage")}
              </Text>

              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={[styles.confirmButton, styles.cancelButton]}
                  onPress={() => setLogoutConfirmVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>
                    {t("general.cancel")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmButton, styles.logoutConfirmButton]}
                  onPress={confirmLogout}
                >
                  <Text style={styles.logoutConfirmText}>
                    {t("profile.logout")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Activity History Modal */}
        <ActivityHistoryModal />

        {/* Saved Reports Modal */}
        <SavedReportsModal />
      </ScrollView>
    </ScreenWithFooter>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  languageSwitcher: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  profileSection: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#148F55",
    borderRadius: 20,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#148F55",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  divider: {
    width: 1,
    backgroundColor: "#EEEEEE",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    margin: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 16,
  },
  dangerText: {
    color: "#e74c3c",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e74c3c",
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
    padding: 16,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
  },
  confirmModalContent: {
    width: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  confirmText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F0F0F0",
    marginRight: 8,
  },
  logoutConfirmButton: {
    backgroundColor: "#e74c3c",
    marginLeft: 8,
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  logoutConfirmText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  activityList: {
    padding: 16,
  },
  activityItem: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  activityContent: {
    marginLeft: 16,
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: "#333",
  },
  activityDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  reportsList: {
    padding: 16,
  },
  reportItem: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    overflow: "hidden",
  },
  reportImage: {
    width: 80,
    height: 80,
  },
  reportContent: {
    padding: 12,
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  reportDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    marginBottom: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  severeBadge: {
    backgroundColor: "#FFE5E5",
  },
  moderateBadge: {
    backgroundColor: "#FFF4E5",
  },
  mildBadge: {
    backgroundColor: "#E5F6E5",
  },
  severityText: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
    textAlign: "center",
  },
  loadingContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
});

export default ProfileScreen;
