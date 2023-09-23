import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

const cleanPercentage = (percentage) => {
  const isNegativeOrNaN = !Number.isFinite(+percentage) || percentage < 0;
  const isTooHigh = percentage > 100;
  return isNegativeOrNaN ? 0 : isTooHigh ? 100 : +percentage;
};

const ProgressCircle = ({ percentage, color }) => {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const strokePct = ((100 - cleanPercentage(percentage)) * circ) / 100;

  return (
    <View>
      <Svg width={90} height={60}>
        <Circle
          r={r}
          cx={50}
          cy={30}
          fill="transparent"
          stroke={strokePct !== circ ? color : 'transparent'}
          strokeWidth={4}
          strokeDasharray={circ}
          strokeDashoffset={percentage ? strokePct : 0}
        />
      </Svg>
      <Text
          style={[
            { fontSize: 20, fontWeight: 'bold' }, // Adjust the styling as needed
          ]}
          x={50}
          y={50}
        >
          {percentage.toFixed(0)}%
        </Text>
    </View>
  );
};

export default ProgressCircle;
