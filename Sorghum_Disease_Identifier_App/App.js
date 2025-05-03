import React from "react";
import AppNavigator from "./src/navigation/index";
import { OfflineProvider } from "./src/contexts/OfflineContext";
import "./src/i18n"; // Import i18n configuration

const App = () => {
  return (
    <OfflineProvider>
      <AppNavigator />
    </OfflineProvider>
  );
};

export default App;
