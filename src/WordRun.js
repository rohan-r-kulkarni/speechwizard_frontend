import React, { useEffect, useState, useRef } from 'react';
import { Animated, Easing, Button, TouchableHighlight, StyleSheet,SafeAreaView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';

const HOSTNAME = "http://10.206.94.15:8080/";

const WordRun = ({route, navigation}) => {
  navigation.setOptions({
    title: "Challenge",

    // headerLeft: () => null, // Disable the back button
  });

  const { suggestions, duration } = route.params;

  const [sentences, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [start, setStart] = useState(false);
  const [cont, setCont] = useState(true);
  const [audpath, setAudPath] = useState("");
  const bounceValue = useRef(new Animated.ValueXY()).current;

  const [recording, setRecording] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState('idle');
  const [audioPermission, setAudioPermission] = useState(null);

  const fetchData = async () => {
    const resp = await fetch(HOSTNAME + 'gptreq', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({"include":suggestions})
                })
    const res_json = await resp.json();
    setSent(res_json.res);                    
    setLoading(false);
  };

  // useFocusEffect(
  //   React.useCallback(() => {
  //     fetchData();
  //   }, [])
  // );

  useEffect(() => {
    fetchData();

    // Simply get recording permission upon first render
    async function getPermission() {
      await Audio.requestPermissionsAsync().then((permission) => {
        setAudioPermission(permission.granted)
      }).catch(error => {
        console.log(error);
      });
    }

    // Call function to get permission
    getPermission()
    // Cleanup upon first render
    return () => {
      if (recording) {
        stopRecording();
      }
    };
  }, [loading]);

  async function startRecording() {
    try {
      // needed for IoS
      if (audioPermission) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true
        })
      }

      const newRecording = new Audio.Recording();
      console.log('Starting Recording')
      await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
      setRecordingStatus('recording');

    } catch (error) {
      console.error('Failed to start recording', error);
    }
  }

  async function stopRecording() {
    try {

      if (recordingStatus === 'recording') {
        console.log('Stopping Recording')
        await recording.stopAndUnloadAsync();
        const recordingUri = recording.getURI();

        // Create a file name for the recording
        const fileName = `recording-${Date.now()}.caf`;

        // Move the recording to the new directory with the new file name
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'recordings/', { intermediates: true });
        await FileSystem.moveAsync({
          from: recordingUri,
          to: FileSystem.documentDirectory + 'recordings/' + `${fileName}`
        });

        const loc = FileSystem.documentDirectory + 'recordings/' + `${fileName}`;

        // resert our states to record again
        setRecording(null);
        setRecordingStatus('stopped');

        try {
          setLoading(true);
          navigation.navigate("Details", {
            orig: sentences,
            audio: loc,
            duration: duration
          });
        } catch (error) {
          console.error("Navigation error:", error);
        }
      }

    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  }

  useEffect(() => {
    if (sentences.length > 0) {
      setCurrentLineIndex(0);
      setCurrentWordIndex(0);
    }
  }, [sentences]);


  useEffect(() => {
    if (start) {
       // Start the animation every 1 second
      const interval = setInterval(() => {
        startBounceAnimation();
      }, duration); // Adjust the interval to control the speed

      // Clear the interval when the component unmounts
      return () => {
        clearInterval(interval);
      };
    }
  }, [currentWordIndex, sentences, start]);

  const moveToNextWord = () => {
    if (sentences.length > 0) {
      if (currentWordIndex < sentences[currentLineIndex].split(' ').length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
      } else {
        // Move to the next line when all words are animated
        if (currentLineIndex < sentences.length - 1) {
          setCurrentLineIndex(currentLineIndex + 1);
          setCurrentWordIndex(0);
        }
      }
    }
  };

  // Function to perform bounce animation
  const startBounceAnimation = () => {
    const dur = duration
    Animated.sequence([
      Animated.timing(bounceValue, {
        toValue: { x: 0, y: 20 }, // Adjust the Y value to control the bounce height
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(bounceValue, {
        toValue: { x: 0, y: 0 },
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start(() => {
      moveToNextWord();
    });
  };

  async function handleRecordButtonPress() {
    if (start) {
      setStart(false);
    }
    else {
      setStart(true);
    }

    if (recording) {
      const audioUri = await stopRecording(recording);

    } else {
      await startRecording();
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {loading ? (
        <Text>Loading...</Text>
      ) : 
      (
      <View style={{flexDirection: 'column', alignItems:'center', paddingBottom:50, gap:40}}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {sentences.length > 0 && sentences[currentLineIndex].split(' ').map((word, index) => (
          <View key={index} style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 32, padding: 3 }}>{word}</Text>
            {index === currentWordIndex ? (
              <Animated.Text
                style={{
                  fontWeight: 'bold',
                  transform: [{ translateX: bounceValue.x }, { translateY: bounceValue.y }],
                  position: 'relative',
                  marginBottom: 8, // Add margin for spacing
                }}
              >
                ●
              </Animated.Text>
            ) : null}
          </View>
        ))}
        
        </View>
        <TouchableHighlight
          style={styles.submit}
          onPress={() => handleRecordButtonPress()}
          underlayColor='#fff'>
            <Text style={[styles.submitText]}>{start ? 'Stop Recording' : 'Start Recording'}</Text>
        </TouchableHighlight>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  submit: {
    width: 200,
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

export default WordRun;
