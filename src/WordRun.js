import React, { useEffect, useState, useRef } from 'react';
import { Animated, Easing, Button, TouchableOpacity, Stylesheet, Text, View } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';

const WordRun = () => {
  const [sentences, setSent] = useState([]);
  const [loading, setLoading] = useState();
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [start, setStart] = useState(false);
  const bounceValue = useRef(new Animated.ValueXY()).current;

  const [recording, setRecording] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState('idle');
  const [audioPermission, setAudioPermission] = useState(null);

  const fetchData = async () => {
    const resp = await fetch('http://127.0.0.1:8080/gptreq', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({"hello":"bye"})
                })
    const res_json = await resp.json();
    setSent(res_json.res);

    console.log(res_json);
    console.log()
                    
    setLoading(false);
  };

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
  }, []);

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

        // This is for simply playing the sound back
        const playbackObject = new Audio.Sound();
        await playbackObject.loadAsync({ uri: FileSystem.documentDirectory + 'recordings/' + `${fileName}` });
        await playbackObject.playAsync();

        const loc = FileSystem.documentDirectory + 'recordings/' + `${fileName}`;
        
        const audioData = await FileSystem.readAsStringAsync(loc, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const url = 'http:127.0.0.1:8080/audio';
        const formData = new FormData();
        formData.append('audioFile', audioData, 'audio.caf');

        // Make an Axios POST request with the FormData
        const response = await axios.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Important for binary data
          },
        });

        // Handle the server's response
        console.log('Upload successful:', response.data);


        // resert our states to record again
        setRecording(null);
        setRecordingStatus('stopped');
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
      }, 100); // Adjust the interval to control the speed

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
    Animated.sequence([
      Animated.timing(bounceValue, {
        toValue: { x: 0, y: 10 }, // Adjust the Y value to control the bounce height
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
      if (audioUri) {
        console.log('Saved audio file to', savedUri);
      }
    } else {
      await startRecording();
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {loading ? (
        <Text>Loading...</Text>
      ) : 
      (
      <View style={{flexDirection: 'column', alignItems:'center', paddingBottom:50}}>
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
        <Button
              title={start ? 'Stop Recording' : 'Start Recording'}
              onPress={() => handleRecordButtonPress()}
            />
      </View>
      )}
    </View>
  );
};

export default WordRun;
