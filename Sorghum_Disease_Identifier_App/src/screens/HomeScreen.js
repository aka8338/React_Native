import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  ImageBackground,
  ActivityIndicator
} from "react-native";
import WeatherReport from "../components/TemperatureDisplay";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import ScreenWithFooter from "../components/ScreenWithFooter";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useOffline } from "../contexts/OfflineContext";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { isOnline } = useOffline();
  const { user } = useAuth();
  const { theme, themeMode, toggleTheme } = useTheme();
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadRecentReports();
  }, []);

  const loadRecentReports = async () => {
    setLoading(true);
    try {
      // Load reports from storage
      const reportData = await AsyncStorage.getItem('diseaseReports');
      if (reportData) {
        const parsedData = JSON.parse(reportData);
        // Sort by date (newest first) and take the first 3
        const sorted = parsedData.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        ).slice(0, 3);
        setRecentReports(sorted);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const FeatureCard = ({ title, icon, description, onPress, color }) => (
    <TouchableOpacity 
      style={[
        styles.featureCard, 
        { 
          borderLeftColor: color,
          backgroundColor: theme.cardColor,
        }
      ]} 
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <MaterialIcons name={icon} size={24} color={color} />
      </View>
      <View style={styles.featureTextContainer}>
        <Text style={[styles.featureTitle, { color: theme.textColor }]}>{title}</Text>
        <Text style={[styles.featureDescription, { color: theme.textColorSecondary }]}>{description}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#BBBBBB" />
    </TouchableOpacity>
  );

  const ReportCard = ({ report }) => (
    <TouchableOpacity 
      style={[styles.reportCard, { backgroundColor: theme.cardColor }]}
      onPress={() => navigation.navigate('DiseaseReport', { identificationData: report })}
    >
      {report.imageUri ? (
        <Image source={{ uri: report.imageUri }} style={styles.reportImage} />
      ) : (
        <View style={styles.noImageContainer}>
          <MaterialIcons name="image" size={30} color="#CCCCCC" />
        </View>
      )}
      <View style={styles.reportInfo}>
        <Text style={[styles.reportDisease, { color: theme.textColor }]}>{report.diseaseName}</Text>
        <Text style={[styles.reportDate, { color: theme.textColorSecondary }]}>
          {new Date(report.date).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <ScreenWithFooter navigation={navigation}>
      <ScrollView style={[styles.scrollView, { backgroundColor: theme.backgroundColorSecondary }]}>
        <View style={styles.container}>
          {/* Background and header section */}
          <ImageBackground
            source={require('../assets/mango-bg.jpg')}
            style={styles.headerBackground}
            resizeMode="cover"
          >
            <View style={styles.headerOverlay}>
              {/* Language switcher in the top right corner */}
              <View style={styles.languageSwitcherContainer}>
                <LanguageSwitcher />
              </View>
              
              <Text style={styles.welcomeText}>
                {t('home.welcome')}{user?.name ? `, ${user.name}` : ''}
              </Text>
              <Text style={styles.appTitle}>
                {t('home.mangoDiseaseFinder')}
              </Text>
            </View>
          </ImageBackground>
          
          {/* Weather report */}
          <View style={[styles.weatherCard, { backgroundColor: theme.cardColor }]}>
            <WeatherReport />
          </View>
          
          {/* Features */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>{t('home.features')}</Text>
            
            <FeatureCard
              title={t('home.identifyDisease')}
              icon="search"
              description={t('home.identifyDescription')}
              onPress={() => navigation.navigate('IdentificationTab')}
              color="#148F55"
            />
            
            <FeatureCard
              title={t('home.diseaseLibrary')}
              icon="bug-report"
              description={t('home.diseaseLibraryDescription')}
              onPress={() => navigation.navigate('DiseasesTab')}
              color="#F9A826"
            />
            
            <FeatureCard
              title={t('home.viewReports')}
              icon="bar-chart"
              description={t('home.reportsDescription')}
              onPress={() => navigation.navigate('ReportsTab')}
              color="#F86A6A"
            />
          </View>
          
          {/* Recent reports */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textColor }]}>{t('home.recentReports')}</Text>
              {recentReports.length > 0 && (
                <TouchableOpacity onPress={() => navigation.navigate('ReportsTab')}>
                  <Text style={[styles.seeAllText, { color: theme.primaryColor }]}>{t('home.seeAll')}</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {loading ? (
              <View style={[styles.loadingContainer, { backgroundColor: theme.cardColor }]}>
                <ActivityIndicator size="small" color="#148F55" />
              </View>
            ) : recentReports.length > 0 ? (
              <View style={styles.reportsContainer}>
                {recentReports.map((report, index) => (
                  <ReportCard key={`report-${index}`} report={report} />
                ))}
              </View>
            ) : (
              <View style={[styles.emptyReportsContainer, { backgroundColor: theme.cardColor }]}>
                <MaterialIcons name="folder-open" size={40} color="#CCCCCC" />
                <Text style={[styles.emptyReportsText, { color: theme.textColorSecondary }]}>{t('home.noReportsYet')}</Text>
                <TouchableOpacity 
                  style={styles.createReportButton}
                  onPress={() => navigation.navigate('IdentificationTab')}
                >
                  <MaterialIcons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.createReportText}>{t('home.createReport')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {/* Tips & advice section */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>{t('home.tipsAndAdvice')}</Text>
            
            <View style={[styles.tipCard, { backgroundColor: theme.cardColor }]}>
              <View style={styles.tipIconContainer}>
                <MaterialIcons name="lightbulb" size={24} color="#F9A826" />
              </View>
              <Text style={[styles.tipText, { color: theme.textColor }]}>{t('home.preventionTip')}</Text>
            </View>
            
            <View style={[styles.tipCard, { backgroundColor: theme.cardColor }]}>
              <View style={styles.tipIconContainer}>
                <MaterialIcons name="opacity" size={24} color="#148F55" />
              </View>
              <Text style={[styles.tipText, { color: theme.textColor }]}>{t('home.wateringTip')}</Text>
            </View>
            
            {/* Theme Toggle Button */}
            <TouchableOpacity 
              style={[styles.themeToggleButton, { backgroundColor: theme.primaryColor }]}
              onPress={toggleTheme}
            >
              <MaterialIcons 
                name={themeMode === 'dark' ? 'light-mode' : 'dark-mode'} 
                size={20} 
                color="#FFFFFF" 
              />
              <Text style={styles.themeToggleText}>
                {themeMode === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenWithFooter>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
  },
  headerBackground: {
    height: 180,
  },
  headerOverlay: {
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 20,
    justifyContent: 'flex-end',
  },
  welcomeText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  appTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  languageSwitcherContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  weatherCard: {
    margin: 16,
    marginTop: -30,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionContainer: {
    margin: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 12,
  },
  seeAllText: {
    color: "#148F55",
    fontWeight: "500",
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
  },
  iconContainer: {
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333333",
  },
  featureDescription: {
    fontSize: 14,
    color: "#6D6D6D",
  },
  reportsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: '31%',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reportImage: {
    width: '100%',
    height: 80,
  },
  noImageContainer: {
    width: '100%',
    height: 80,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportInfo: {
    padding: 8,
  },
  reportDisease: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 10,
    color: "#6D6D6D",
  },
  emptyReportsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emptyReportsText: {
    fontSize: 14,
    color: "#6D6D6D",
    marginTop: 8,
    marginBottom: 16,
  },
  createReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#148F55",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createReportText: {
    color: "#FFFFFF",
    marginLeft: 4,
    fontWeight: "500",
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tipIconContainer: {
    marginRight: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#333333",
  },
  loadingContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  themeToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#148F55",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  themeToggleText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontWeight: "500",
  },
});

export default HomeScreen;
