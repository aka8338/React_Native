import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const API_KEY = "7a6b1217f4134a526ee5bca3e084348b"; // OpenWeatherMap API key

const HomeScreen = () => {
  const [temperature, setTemperature] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null); // Reset error state

      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Addis Ababa&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();
        if (data.main) {
          setTemperature(data.main.temp);
        } else {
          setError("Weather data not available for Addis Ababa.");
        }
      } catch (err) {
        setError("Failed to fetch weather data");
      } finally {
        setLoading(false);
      }
    };

    // Fetch weather data for Addis Ababa
    fetchWeather();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Current Weather in Addis Ababa
      </Text>

      {loading ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : error ? (
        <Text style={{ color: "red", marginBottom: 20 }}>{error}</Text>
      ) : temperature !== null ? (
        <Text style={{ fontSize: 18, marginBottom: 20 }}>
          Current temperature in Addis Ababa: {Math.round(temperature)}°C
        </Text>
      ) : (
        <Text style={{ fontSize: 18, marginBottom: 20 }}>
          Loading temperature...
        </Text>
      )}
    </View>
  );
};

export default HomeScreen;
