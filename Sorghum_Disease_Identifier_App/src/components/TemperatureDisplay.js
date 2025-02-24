import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text } from "react-native";

const WEATHER_API_KEY = "7a6b1217f4134a526ee5bca3e084348b"; // OpenWeatherMap API key

const TemperatureDisplay = ({ selectedCity }) => {
  const [temperature, setTemperature] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedCity) return;

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${selectedCity.lat}&lon=${selectedCity.lon}&units=metric&appid=${WEATHER_API_KEY}`
        );
        const data = await response.json();
        if (data.main) {
          setTemperature(data.main.temp);
        } else {
          setError("Weather data not available");
        }
      } catch (err) {
        setError("Failed to fetch weather data");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [selectedCity]);

  if (loading) {
    return <ActivityIndicator size="small" color="#0000ff" />;
  }

  if (error) {
    return <Text style={{ color: "red", marginBottom: 20 }}>{error}</Text>;
  }

  if (selectedCity && temperature !== null) {
    return (
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Current temperature in {selectedCity.name}: {Math.round(temperature)}°C
      </Text>
    );
  }

  return null;
};

export default TemperatureDisplay;
