import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

const API_KEY = "7a6b1217f4134a526ee5bca3e084348b"; // Replace with your OpenWeatherMap API key

const WeatherReport = () => {
  const { t } = useTranslation();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationInput, setLocationInput] = useState("");
  const [backgroundImage, setBackgroundImage] = useState(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async (location = null) => {
    try {
      let latitude, longitude;

      if (location) {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();
        if (response.ok) {
          latitude = data.coord.lat;
          longitude = data.coord.lon;
        } else {
          setError("Location not found");
          setLoading(false);
          return;
        }
      } else {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Location permission denied");
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        latitude = location.coords.latitude;
        longitude = location.coords.longitude;
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
      );
      const data = await response.json();

      if (response.ok) {
        setWeatherData({
          location: data.name,
          temperature: `${Math.round(data.main.temp)}°C`,
          condition: data.weather[0].main,
          weatherIcon: getWeatherIcon(data.weather[0].main),
        });
        setBackgroundImage(getBackgroundImage(data.weather[0].main));
      } else {
        setError("Failed to fetch weather data");
      }
    } catch (err) {
      setError("Error fetching weather data");
    }
    setLoading(false);
  };

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

  const getBackgroundImage = (condition) => {
    const images = {
      Clear: require("../assets/clear.jpg"),
      Clouds: require("../assets/clouds.jpg"),
      Rain: require("../assets/rain.jpg"),
      Drizzle: require("../assets/drizzle.jpg"),
      Thunderstorm: require("../assets/thunderstorm.jpg"),
      Snow: require("../assets/snow.jpg"),
      Mist: require("../assets/mist.jpg"),
    };
    return images[condition] || require("../assets/default.jpg");
  };

  const handleLocationChange = () => {
    if (locationInput.trim()) {
      setLoading(true);
      fetchWeather(locationInput.trim());
    }
  };

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.backgroundImage}
      blurRadius={2}
    >
      <View style={styles.container}>
        <Text style={styles.title}>{t("weather.weatherReport")}</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#148F55" />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <View style={styles.card}>
            <View style={styles.textContainer}>
              <Text style={styles.location}>{weatherData.location}</Text>
              <Text style={styles.temperature}>{weatherData.temperature}</Text>
              <Text style={styles.condition}>{weatherData.condition}</Text>
            </View>

            <MaterialCommunityIcons
              name={weatherData.weatherIcon}
              size={50}
              color="#333"
              style={styles.weatherIcon}
            />
          </View>
        )}

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={t("weather.enterLocation")}
            value={locationInput}
            onChangeText={setLocationInput}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleLocationChange}
          >
            <Text style={styles.searchButtonText}>{t("general.search")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 16,
    borderRadius: 10,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  textContainer: {
    flex: 1,
  },
  location: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  temperature: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#148F55",
    marginVertical: 5,
  },
  condition: {
    fontSize: 16,
    color: "#666",
  },
  weatherIcon: {
    marginLeft: 10,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    marginTop: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 25,
    overflow: "hidden",
  },
  searchInput: {
    flex: 1,
    padding: 10,
    paddingLeft: 15,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: "#148F55",
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default WeatherReport;
