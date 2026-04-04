import { useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions, GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, PaintBrush, Eraser, XCircle, ArrowCounterClockwise } from 'phosphor-react-native';
import Animated, { FadeInDown, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';
import { setPixelIcon, GRID_SIZE, createEmptyGrid } from '@/utils/pixel-icon-store';
import { PixelIcon } from '@/components/shared/pixel-icon';
import { saveCustomIcon } from '@/lib/api/custom-icons';

const { width: SCREEN_W } = Dimensions.get('window');
const CONTENT_PADDING = 20;
const GRID_WIDTH = SCREEN_W - CONTENT_PADDING * 2;
const CELL_SIZE = Math.floor(GRID_WIDTH / GRID_SIZE);
const ACTUAL_GRID = CELL_SIZE * GRID_SIZE;

type Tool = 'brush' | 'eraser';

export default function PixelEditorScreen() {
  const router = useRouter();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const insets = useSafeAreaInsets();

  const [grid, setGrid] = useState<number[][]>(createEmptyGrid);
  const [tool, setTool] = useState<Tool>('brush');
  const [history, setHistory] = useState<number[][][]>([]);
  const gridRef = useRef<View>(null);
  const gridOriginRef = useRef({ x: 0, y: 0 });
  const lastToggledRef = useRef<string | null>(null);

  const hasPixels = grid.some((row) => row.some((cell) => cell === 1));

  const getCellFromTouch = useCallback((pageX: number, pageY: number) => {
    const col = Math.floor((pageX - gridOriginRef.current.x) / CELL_SIZE);
    const row = Math.floor((pageY - gridOriginRef.current.y) / CELL_SIZE);
    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      return { row, col };
    }
    return null;
  }, []);

  const paintCell = useCallback((row: number, col: number) => {
    const key = `${row}-${col}`;
    if (lastToggledRef.current === key) return;
    lastToggledRef.current = key;

    const value = tool === 'brush' ? 1 : 0;
    setGrid((prev) => {
      if (prev[row][col] === value) return prev;
      const next = prev.map((r) => [...r]);
      next[row][col] = value;
      return next;
    });
    Haptics.selectionAsync();
  }, [tool]);

  const handleTouchStart = useCallback((e: GestureResponderEvent) => {
    // Save state for undo before starting a new stroke
    setHistory((prev) => [...prev.slice(-20), grid]);

    gridRef.current?.measureInWindow((x, y) => {
      gridOriginRef.current = { x, y };
    });
    lastToggledRef.current = null;
    const { pageX, pageY } = e.nativeEvent;
    setTimeout(() => {
      const cell = getCellFromTouch(pageX, pageY);
      if (cell) paintCell(cell.row, cell.col);
    }, 10);
  }, [getCellFromTouch, paintCell, grid]);

  const handleTouchMove = useCallback((e: GestureResponderEvent) => {
    const { pageX, pageY } = e.nativeEvent;
    const cell = getCellFromTouch(pageX, pageY);
    if (cell) paintCell(cell.row, cell.col);
  }, [getCellFromTouch, paintCell]);

  const handleUndo = () => {
    if (history.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setGrid(prev);
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHistory((prev) => [...prev.slice(-20), grid]);
    setGrid(createEmptyGrid());
    lastToggledRef.current = null;
  };

  const handleSave = async () => {
    console.log('[PixelEditor] handleSave called');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPixelIcon(grid);
    console.log('[PixelEditor] setPixelIcon done, calling dismiss');
    saveCustomIcon(grid).catch(() => {});
    router.dismiss();
    console.log('[PixelEditor] dismiss called');
  };

  return (
    <View style={[styles.root, { backgroundColor: bgColor, paddingTop: insets.top }]}>
      <View style={[styles.stickyClose, { marginTop: 4 }]}>
        <Pressable
          onPress={() => router.dismiss()}
          style={[styles.closeCircle, { backgroundColor: surfaceColor }]}
        >
          <X size={18} color={secondaryColor} weight="bold" />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(400).easing(Easing.out(Easing.cubic))}>
          <Text style={[styles.title, { color: textColor }]}>Draw your icon</Text>
        </Animated.View>

        {/* Tools + Preview */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(100).easing(Easing.out(Easing.cubic))}
          style={styles.toolRow}
        >
          <Pressable
            onPress={() => { Haptics.selectionAsync(); setTool('brush'); }}
            style={[styles.toolButton, { backgroundColor: tool === 'brush' ? textColor : surfaceColor }]}
          >
            <PaintBrush size={20} color={tool === 'brush' ? bgColor : secondaryColor} weight="fill" />
          </Pressable>
          <Pressable
            onPress={() => { Haptics.selectionAsync(); setTool('eraser'); }}
            style={[styles.toolButton, { backgroundColor: tool === 'eraser' ? textColor : surfaceColor }]}
          >
            <Eraser size={20} color={tool === 'eraser' ? bgColor : secondaryColor} weight="fill" />
          </Pressable>
          <View style={{ flex: 1 }} />
          <View style={[styles.previewCircle, { backgroundColor: surfaceColor }]}>
            <PixelIcon data={grid} size={22} color={textColor} />
          </View>
        </Animated.View>

        {/* Grid */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(200).easing(Easing.out(Easing.cubic))}
          style={styles.gridContainer}
        >
          <View
            ref={gridRef}
            style={[styles.grid, { backgroundColor: surfaceColor }]}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderStart={handleTouchStart}
            onResponderMove={handleTouchMove}
          >
            {grid.map((row, r) => (
              <View key={r} style={styles.gridRow}>
                {row.map((cell, c) => (
                  <View
                    key={`${r}-${c}`}
                    style={[
                      styles.cell,
                      {
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        backgroundColor: cell === 1 ? textColor : 'transparent',
                        borderColor: `${secondaryColor}15`,
                      },
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>
        </Animated.View>

      </View>

      {/* Bottom: undo + clear + save */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable
          onPress={handleUndo}
          disabled={history.length === 0}
          style={[styles.iconButton, { backgroundColor: surfaceColor, opacity: history.length > 0 ? 1 : 0.3 }]}
        >
          <ArrowCounterClockwise size={20} color={secondaryColor} weight="bold" />
        </Pressable>
        <Pressable
          onPress={handleClear}
          disabled={!hasPixels}
          style={[styles.iconButton, { backgroundColor: surfaceColor, opacity: hasPixels ? 1 : 0.3 }]}
        >
          <XCircle size={20} color={secondaryColor} weight="bold" />
        </Pressable>
        <Pressable
          onPress={handleSave}
          disabled={!hasPixels}
          style={[styles.saveButton, { backgroundColor: textColor, opacity: hasPixels ? 1 : 0.25 }]}
        >
          <Text style={[styles.saveText, { color: bgColor }]}>Save icon</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stickyClose: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 },
  closeCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  content: { flex: 1, paddingHorizontal: CONTENT_PADDING },
  title: {
    fontSize: 36,
    fontFamily: Fonts.medium,
    lineHeight: 40,
    letterSpacing: 36 * -0.05,
    marginBottom: 24,
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  toolButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    alignItems: 'center',
  },
  grid: {
    width: ACTUAL_GRID,
    height: ACTUAL_GRID,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  gridRow: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 0.5,
    borderRadius: 2,
  },
  previewCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
});
