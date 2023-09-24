import React, { useEffect, useState, useRef } from 'react';
import { Animated, Easing, Button, TouchableHighlight, StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import ProgressCircle from './widgets/ProgressCircle';
import * as Speech from 'expo-speech';

const HOSTNAME = "http://10.206.94.15:8080/";
const av = new Animated.Value(0);
av.addListener(() => {return});

function Details({route, navigation}) {
  navigation.setOptions({
    title: "Wizard Wisdom",
    headerLeft: () => null, // Disable the back button
  });

  const { orig, audio, duration } = route.params;
  const [script, setScript] = useState("");
  const [wizard, setWizard] = useState("") 
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state
  const [perc, setPerc] = useState(0);
  const [sug, setSug] = useState([])
  const [cloudsound, setCloudSound] = React.useState();

  useEffect(() => {
    setWizard(orig.join(" "));

    async function get_transcription(){
      const audioData = await FileSystem.readAsStringAsync(audio, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      const url = HOSTNAME + 'audio';
      const formData = new FormData();
      formData.append('audioFile', audioData, 'audio.caf');
      const analytics_url = HOSTNAME + 'text-analysis'
  
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
        setSug(analytics.data.suggestions)
      }
      catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false); // Set isLoading to false when done fetching
      }
      
    }

    get_transcription();

  }, []);

  async function playAudio(){
    const playbackObject = new Audio.Sound();
    await playbackObject.loadAsync({ uri: audio });
    await playbackObject.playAsync();
  }

  // async function playWizard(){

    //get the wizard b64
    // const url = 'http:127.0.0.1:8080/text-analysis';

    // try {
    //   const response = await axios.get(url);
    //   const filename = FileSystem.documentDirectory + "cloud-audio.mp3";
    //   await FileSystem.writeAsStringAsync(filename, response.bdata, {
    //     encoding: FileSystem.EncodingType.Base64,
    //   });
    //   console.log(filename);

      // const { sound } = await Audio.Sound.createAsync(filename);
      // setSound(sound);

      // console.log('Playing Sound');
      // await sound.playAsync();
    // }
    // catch (error) {
    //   console.error('Cloud Audio Error:', error);
    // } 

  // }

  const speakText =  (text) => {
    try {
      // Speak the provided text
      Speech.speak(text);

    } catch (error) {
      console.error('Speech error:', error);
    }
  };

  const TopBar = () => {
    return (
      <View style={styles.topBar}>
        <TouchableHighlight
          style={styles.topButton}
          onPress={() => playAudio()}
          underlayColor='#fff'>
            <Text style={[styles.topButtonText]}>Play Your Words</Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={styles.topButton}
          onPress={() => speakText("hello world!")}
          underlayColor='#fff'>
            <Text style={[styles.topButtonText]}>Play Wizard Words</Text>
        </TouchableHighlight>
      </View>
    );
  };

  const BottomBar = () => {
    return (
      <View style={styles.bottomBar}>
        <TouchableHighlight
        style={styles.bottomButton}
        onPress={() => navigation.navigate("Home")}
        underlayColor='#fff'>
          <Text style={[styles.bottomButtonText]}>Quit</Text>
      </TouchableHighlight>
      {sug.length > 0 && <Text style={{ fontSize: 18, color: 'red'}}>Work On: {sug.join(", ")}</Text>}
      <TouchableHighlight
        style={styles.bottomButton}
        onPress={() => navigation.navigate("WordRun", {
          suggestions : sug,
          duration: duration
        })}
        underlayColor='#fff'>
          <Text style={[styles.bottomButtonText]}>Next level!</Text>
      </TouchableHighlight>
        {/* <Button title="Quit :(" onPress={() => navigation.navigate("Home")} />
        
        <Button title="Next level!" onPress={() => navigation.navigate("WordRun", {
          suggestions : sug,
          duration: duration
        })} /> */}
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
            <Text style={{ fontSize: 18}}>Loading...</Text>
          ) : (
            <Text style={{ fontSize: 18}}>{script}</Text> // Render the fetched script when not loading
          )}
      </View>
      <View style={styles.separator}></View>
      <View style={styles.block}>
        <Text style={styles.header}>Wizard Words</Text>
        {isLoading ? ( // Conditional rendering based on isLoading
            <Text style={{ fontSize: 18}}>Loading...</Text>
          ) : (
            <Text style={{ fontSize: 18}}>{wizard}</Text> // Render the fetched script when not loading
          )}
      </View>
    </View>
    <ProgressCircle percentage={perc} color="#007bff" />
    <BottomBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bottomButton: {
    width: 110,
    marginRight: 20,
    marginLeft: 20,
    marginTop: 10,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#007bff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  bottomButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
  topButton: {
    width: 150,
    marginRight: 10,
    marginLeft: 10,
    marginTop: 10,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  topButtonText: {
    color: '#007bff',
    textAlign: 'center',
    fontSize: 14,
  },
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