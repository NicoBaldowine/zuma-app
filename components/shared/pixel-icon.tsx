import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

type PixelIconProps = {
  data: number[][];
  size: number;
  color: string;
};

export const PixelIcon = React.memo(function PixelIcon({ data, size, color }: PixelIconProps) {
  const pixelSize = size / (data.length || 16);

  const pixels = useMemo(() => {
    const result: Array<{ row: number; col: number }> = [];
    for (let r = 0; r < data.length; r++) {
      for (let c = 0; c < (data[r]?.length ?? 0); c++) {
        if (data[r][c] === 1) {
          result.push({ row: r, col: c });
        }
      }
    }
    return result;
  }, [data]);

  return (
    <View style={{ width: size, height: size }}>
      {pixels.map(({ row, col }) => (
        <View
          key={`${row}-${col}`}
          style={{
            position: 'absolute',
            top: row * pixelSize,
            left: col * pixelSize,
            width: pixelSize,
            height: pixelSize,
            backgroundColor: color,
            borderRadius: pixelSize * 0.15,
          }}
        />
      ))}
    </View>
  );
});
