import React, { useEffect, useState, useRef } from 'react';
import { Animated, Image, Easing, Button, TouchableHighlight, StyleSheet,SafeAreaView, Text, View } from 'react-native';
import { Slider } from 'react-native-elements';

function Home({ navigation }) {
  navigation.setOptions({
    title: "",

    // headerLeft: () => null, // Disable the back button
  });

  const [wpm, setWpm] = useState(100); // Initial WPM

  const navigateToWordRun = () => {
    navigation.navigate('WordRun', { suggestions:[], "duration":10000/wpm });
  };

  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'stretch', justifyContent: 'center' }}>
       <View style={{ alignItems: 'center' }}>
        <Image
          style={styles.tinyLogo}
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/512/1470/1470738.png',
          }}
        />
        <View style={{marginBottom:30, alignItems:'center'}}>
          <Text style={{ fontSize: 30}}>Speech</Text>
          <Text style={{ fontSize: 40, fontStyle:'italic', fontWeight: 'bold', color:'#007bff'}} >Wizard</Text>
        </View>
        <Text style={{ fontSize: 20 }}>Select WPM: {wpm}</Text>
        <Slider
          style={{ width: 200, height: 40, alignContent:'center' }}
          minimumValue={10}
          maximumValue={150}
          thumbStyle={{ height: 20, width: 20, backgroundColor: '#007bff' }}
          step={10}
          value={wpm}
          onValueChange={(value) => setWpm(value)}
        />
        <TouchableHighlight
        style={styles.submit}
        onPress={() => navigateToWordRun()}
        underlayColor='#fff'>
          <Text style={[styles.submitText]}>Play!</Text>
      </TouchableHighlight>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tinyLogo: {
    width: 50,
    height: 50,
  },
  logo: {
    width: 66,
    height: 58,
  },
  submit: {
    width: 100,
    marginRight: 40,
    marginLeft: 40,
    marginTop: 10,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#007bff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  submitText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 20,
  }
});

export default Home;