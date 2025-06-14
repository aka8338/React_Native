import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Image,
  Dimensions 
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import ScreenWithFooter from '../components/ScreenWithFooter';
import { useOffline } from '../contexts/OfflineContext';
import { BarChart } from 'react-native-chart-kit';
import { DiseaseReportService } from '../services/api';

const screenWidth = Dimensions.get('window').width;

const ReportsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { isOnline } = useOffline();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'chart'

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      let reportData;
      
      if (isOnline) {
        // Fetch from server when online
        try {
          const serverReports = await DiseaseReportService.getReports();
          reportData = JSON.stringify(serverReports);
          // Update local storage with server data
          await AsyncStorage.setItem('diseaseReports', reportData);
        } catch (error) {
          console.error('Error fetching reports from server:', error);
          // Fallback to local data if server fetch fails
          reportData = await AsyncStorage.getItem('diseaseReports');
        }
      } else {
        // Use local data when offline
        reportData = await AsyncStorage.getItem('diseaseReports');
      }

      if (reportData) {
        const parsedData = JSON.parse(reportData);
        setReports(parsedData);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = () => {
    // Count occurrences of each disease
    const diseaseCounts = {};
    reports.forEach(report => {
      const disease = report.diseaseName;
      diseaseCounts[disease] = (diseaseCounts[disease] || 0) + 1;
    });

    // Format data for chart
    return {
      labels: Object.keys(diseaseCounts).slice(0, 5), // Show top 5 diseases
      datasets: [
        {
          data: Object.values(diseaseCounts).slice(0, 5),
        },
      ],
    };
  };

  const renderReportItem = ({ item, index }) => {
    return (
      <TouchableOpacity 
        style={styles.reportCard}
        onPress={() => navigation.navigate('DiseaseReport', { identificationData: item })}
      >
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle}>{item.diseaseName}</Text>
          <View style={[styles.severityBadge, 
            item.severity === 'severe' ? styles.severeBadge : 
            item.severity === 'moderate' ? styles.moderateBadge : 
            styles.mildBadge
          ]}>
            <Text style={styles.severityText}>{t(`reporting.${item.severity}`)}</Text>
          </View>
        </View>
        
        {item.imageUri && (
          <Image source={{ uri: item.imageUri }} style={styles.reportImage} />
        )}
        
        <View style={styles.reportDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="location-on" size={16} color="#6D6D6D" />
            <Text style={styles.detailText}>{item.location || t('reporting.locationUnknown')}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="event" size={16} color="#6D6D6D" />
            <Text style={styles.detailText}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
          
          {item.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>{t('reporting.notes')}:</Text>
              <Text style={styles.notesText} numberOfLines={2}>{item.notes}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderChartView = () => {
    if (reports.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="bar-chart" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>{t('reports.noDataToDisplay')}</Text>
        </View>
      );
    }

    const chartData = generateChartData();
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{t('reports.diseasesDistribution')}</Text>
        <BarChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          chartConfig={{
            backgroundColor: '#FFFFFF',
            backgroundGradientFrom: '#FFFFFF',
            backgroundGradientTo: '#FFFFFF',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(20, 143, 85, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={styles.chart}
        />
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{reports.length}</Text>
            <Text style={styles.statLabel}>{t('reports.totalReports')}</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Object.keys(reports.reduce((acc, report) => {
                acc[report.diseaseName] = true;
                return acc;
              }, {})).length}
            </Text>
            <Text style={styles.statLabel}>{t('reports.uniqueDiseases')}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenWithFooter navigation={navigation}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('reports.diseaseReports')}</Text>
          
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'list' && styles.activeToggle]}
              onPress={() => setViewMode('list')}
            >
              <MaterialIcons 
                name="list" 
                size={24} 
                color={viewMode === 'list' ? '#148F55' : '#6D6D6D'} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'chart' && styles.activeToggle]}
              onPress={() => setViewMode('chart')}
            >
              <MaterialIcons 
                name="bar-chart" 
                size={24} 
                color={viewMode === 'chart' ? '#148F55' : '#6D6D6D'} 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#148F55" />
            <Text style={styles.loadingText}>{t('general.loading')}</Text>
          </View>
        ) : viewMode === 'list' ? (
          reports.length > 0 ? (
            <FlatList
              data={reports}
              renderItem={renderReportItem}
              keyExtractor={(item, index) => `report-${index}`}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="folder-open" size={64} color="#CCCCCC" />
              <Text style={styles.emptyText}>{t('reports.noReportsYet')}</Text>
              <TouchableOpacity 
                style={styles.createReportButton}
                onPress={() => navigation.navigate('IdentificationTab')}
              >
                <Text style={styles.createReportButtonText}>{t('reports.identifyDisease')}</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          renderChartView()
        )}
      </View>
    </ScreenWithFooter>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    padding: 4,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 16,
  },
  activeToggle: {
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severeBadge: {
    backgroundColor: '#FFE5E5',
  },
  moderateBadge: {
    backgroundColor: '#FFF4E5',
  },
  mildBadge: {
    backgroundColor: '#E5F6E5',
  },
  severityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  reportImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  reportDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6D6D6D',
  },
  notesContainer: {
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  notesText: {
    fontSize: 14,
    color: '#6D6D6D',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6D6D6D',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6D6D6D',
    marginTop: 16,
    textAlign: 'center',
  },
  createReportButton: {
    marginTop: 20,
    backgroundColor: '#148F55',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createReportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  chartContainer: {
    padding: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '45%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#148F55',
  },
  statLabel: {
    fontSize: 14,
    color: '#6D6D6D',
    marginTop: 4,
  },
});

export default ReportsScreen; 