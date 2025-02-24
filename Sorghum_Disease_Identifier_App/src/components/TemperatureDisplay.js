import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location"; // For getting user's location
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const API_KEY = "7a6b1217f4134a526ee5bca3e084348b"; // Replace with your OpenWeatherMap API key

const WeatherReport = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      // Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied");
        setLoading(false);
        return;
      }

      // Get user's current location
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Fetch weather data from OpenWeatherMap API
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
      );
      const data = await response.json();

      if (response.ok) {
        setWeatherData({
          location: data.name,
          temperature: `${Math.round(data.main.temp)}°C`,
          sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
          rainForecast: data.weather[0].description, // e.g., "light rain"
          weatherIcon: getWeatherIcon(data.weather[0].main),
        });
      } else {
        setError("Failed to fetch weather data");
      }
    } catch (err) {
      setError("Error fetching weather data");
    }
    setLoading(false);
  };

  // Function to map OpenWeatherMap conditions to MaterialCommunityIcons
  const getWeatherIcon = (condition) => {
    const icons = {
      Clear: "weather-sunny",
      Clouds: "weather-cloudy",
      Rain: "weather-rainy",
      Drizzle: "weather-partly-rainy",
      Thunderstorm: "weather-lightning",
      Snow: "weather-snowy",
      Mist: "weather-fog",
    };
    return icons[condition] || "weather-cloudy";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather Report</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#148F55" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <View style={styles.card}>
          <View style={styles.textContainer}>
            <Text style={styles.location}>{weatherData.location}</Text>
            <Text style={styles.temperature}>{weatherData.temperature}</Text>
            <Text style={styles.sunset}>☀️ Sunset: {weatherData.sunset}</Text>
            <Text style={styles.rainForecast}>{weatherData.rainForecast}</Text>
          </View>

          <MaterialCommunityIcons
            name={weatherData.weatherIcon}
            size={50}
            color="#333"
            style={styles.weatherIcon}
          />
        </View>
      )}
    </View>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
  },
  location: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  temperature: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  sunset: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  rainForecast: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  weatherIcon: {
    marginLeft: 10,
  },
  error: {
    color: "red",
    textAlign: "center",
  },
});

export default WeatherReport;
