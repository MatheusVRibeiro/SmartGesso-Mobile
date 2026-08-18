import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, sizes, spacing } from '../../theme';

export interface ScreenContainerProps {
  children: React.ReactNode;
  /** Envolve o conteúdo em ScrollView (default: false). */
  scroll?: boolean;
  /** Padding padrão da tela: `true` usa sizes.screenPadding, número usa valor custom. */
  padding?: boolean | number;
  /** Envolve o conteúdo em KeyboardAvoidingView (default: true). */
  keyboard?: boolean;
  backgroundColor?: string;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  testID?: string;
}

function ScreenContainer({
  children,
  scroll = false,
  padding = true,
  keyboard = true,
  backgroundColor = colors.background,
  edges = ['top', 'left', 'right'],
  style,
  contentContainerStyle,
  testID,
}: ScreenContainerProps) {
  const paddingValue =
    typeof padding === 'number' ? padding : padding ? sizes.screenPadding : 0;

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { padding: paddingValue },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[styles.content, { padding: paddingValue }, contentContainerStyle]}
    >
      {children}
    </View>
  );

  const inner = keyboard ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  return (
    <SafeAreaView
      testID={testID}
      edges={edges}
      style={[styles.safe, { backgroundColor }, style]}
    >
      {inner}
    </SafeAreaView>
  );
}

export default ScreenContainer;
export { ScreenContainer };

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});