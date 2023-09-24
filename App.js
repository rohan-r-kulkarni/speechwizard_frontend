import React from "react";
import {View, Text, Image, ScrollView, TextInput} from 'react-native';
// import Home from "./src/Home.js"; // Import your existing home page component
import { Navigation, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './src/Home';
import Details from './src/Details';
import WordRun from './src/WordRun';
import AudioTest from './src/AudioTest';

const Stack = createStackNavigator();

function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Details" component={Details} />
        <Stack.Screen name="AudioTest" component={AudioTest} />
        <Stack.Screen name="WordRun" component={WordRun} key="WordRun" />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// import * as React from 'react';
// import { Button, View, Text } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';

// function App({ navigation }) {
//   return (
//     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//       <Text>Home Screen</Text>
//       <Button
//         title="Go to Details"
//         onPress={() => navigation.navigate('Details')}
//       />
//     </View>
//   );
// }

export default App;
