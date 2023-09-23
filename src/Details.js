import React, { useEffect, useState, useRef } from 'react';
import { Animated, Easing, Button, TouchableOpacity, StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import ProgressCircle from './widgets/ProgressCircle';

function Details({route, navigation}) {
  navigation.setOptions({
    title: "Wizard Wisdom",
    headerLeft: () => null, // Disable the back button
  });

  const { orig, audio } = route.params;
  const [script, setScript] = useState("");
  const [wizard, setWizard] = useState("") 
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state
  const [perc, setPerc] = useState(0);

  useEffect(() => {
    setWizard(orig.join(" "));

    async function get_transcription(){
      const audioData = await FileSystem.readAsStringAsync(audio, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      const url = 'http:127.0.0.1:8080/audio';
      const formData = new FormData();
      formData.append('audioFile', audioData, 'audio.caf');
      const analytics_url = 'http:127.0.0.1:8080/text-analysis'
  
      try {
        const response = await axios.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Important for binary data
          },
        });
    
        // Handle the server's response
        setScript(response.data.text)

        const textData = JSON.parse('{"user_text":\"' +  response.data.text + '\", "wizard_text":\"' + orig.join("") + '\"}')

        const analytics = await axios.post(analytics_url, textData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setPerc(analytics.data.similarity)
      }
      catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false); // Set isLoading to false when done fetching
      }
      
    }

    get_transcription();

  }, []);

  async function play_audio(){
    const playbackObject = new Audio.Sound();
    await playbackObject.loadAsync({ uri: audio });
    await playbackObject.playAsync();
  }

  const TopBar = () => {
    return (
      <View style={styles.topBar}>
        <Button color="#ffffff" title="Play Your Words" onPress={() => play_audio()} />
        <Button color="#ffffff" title="Right" onPress={() => console.log('Right button pressed')} />
      </View>
    );
  };

  const BottomBar = () => {
    return (
      <View style={styles.bottomBar}>
        <Button title="Quit :(" onPress={() => navigation.navigate("Home")} />
        <Button title="Next level!" onPress={() => console.log('Right button pressed')} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

    <TopBar />
    <View style={styles.content}>
      <View style={styles.block}>
        <Text style={styles.header}>Your Words</Text>
        {isLoading ? ( // Conditional rendering based on isLoading
            <Text style={{ fontSize: 20}}>Loading...</Text>
          ) : (
            <Text style={{ fontSize: 20}}>{script}</Text> // Render the fetched script when not loading
          )}
      </View>
      <View style={styles.separator}></View>
      <View style={styles.block}>
        <Text style={styles.header}>Wizard Words</Text>
        {isLoading ? ( // Conditional rendering based on isLoading
            <Text style={{ fontSize: 20}}>Loading...</Text>
          ) : (
            <Text style={{ fontSize: 20}}>{wizard}</Text> // Render the fetched script when not loading
          )}
      </View>
    </View>
    <ProgressCircle percentage={perc} color="#007bff" />
    <BottomBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    padding:5
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#007bff', // Example background color for the top bar
    padding: 10,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F2F7FF', // Example background color for the top bar
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white', // Text color for the title
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16, // Adjust the padding as needed
    paddingTop: 16, // Adjust the padding as needed
  },
  button: {
    backgroundColor: 'blue', // Adjust the button styles as needed
    paddingVertical: 8, // Adjust the padding as needed
    paddingHorizontal: 12, // Adjust the padding as needed
    borderRadius: 8, // Adjust the border radius as needed
  },
  buttonText: {
    color: 'white', // Adjust the text color as needed
    fontSize: 16, // Adjust the font size as needed
    fontWeight: 'bold', // Adjust the font weight as needed
  },
  block: {
    flex: 1,
    padding: 10,
  },
  separator: {
    width: 1,
    height: '100%',
    backgroundColor: '#ccc',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default Details;