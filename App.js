import * as React from 'react';
import { AppRegistry } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import App from './Pages/App';
import AppBaar from './Pages/Components/AppBar'

export default function Main() {
  return (
    <PaperProvider>
      
     
     <AppBaar/>
      <App />
           
      
    </PaperProvider>
  );
}

AppRegistry.registerComponent('main', () => Main);