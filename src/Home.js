import React from 'react';
import { View, Text, Button } from 'react-native';

function HomeScreen({ navigation }) {
  return (
    <View>
      <Text>Home Screen</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details')}
      />
      <Button
        title="Go to AudioTest"
        onPress={() => navigation.navigate('AudioTest')}
      />
      <Button
        title="Go to WordRun"
        onPress={() => navigation.navigate('WordRun')}
      />
    </View>
  );
}

export default HomeScreen;