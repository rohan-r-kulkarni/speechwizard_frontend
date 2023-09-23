import React, { useEffect, useState, useRef } from 'react';
import { Animated, Easing, Button, Text, View } from 'react-native';
// import Orientation from 'react-native-orientation-locker';

// const sentences = ;

const WordRun = () => {
  const [sentences, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const bounceValue = useRef(new Animated.ValueXY()).current;

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
  }, []);

  useEffect(() => {
    if (sentences.length > 0) {
      setCurrentLineIndex(0);
      setCurrentWordIndex(0);
    }
  }, [sentences]);


  useEffect(() => {
    // Start the animation every 1 second
    const interval = setInterval(() => {
      startBounceAnimation();
    }, 100); // Adjust the interval to control the speed

    // Clear the interval when the component unmounts
    return () => {
      clearInterval(interval);
    };
  }, [currentWordIndex, sentences]);

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

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {loading ? (
        <Text>Loading...</Text>
      ) : 
      (
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
      )}
    </View>
  );
};

export default WordRun;
