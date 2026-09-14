import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import type { ScrollView as ScrollViewType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sizes, useSizeClass } from '../../theme';
import type { SizeClass } from '../../theme';
import { useAppTheme } from '../../theme/ThemeProvider';

export interface ScreenContainerProps {
  children: React.ReactNode;
  /** Envolve o conteúdo em ScrollView (default: false). */
  scroll?: boolean;
  /** Padding padrão da tela: `true` usa sizes.screenPadding, número usa valor custom. */
  padding?: boolean | number;
  /** Envolve o conteúdo em KeyboardAvoidingView (default: true). */
  keyboard?: boolean;
  /**
   * Envolve o conteúdo em KeyboardAvoidingView otimizado para formulários
   * (default: false). Quando `true`, tem precedência sobre `keyboard`.
   * iOS: behavior 'padding' com keyboardVerticalOffset p/ headers custom.
   * Android: behavior undefined — o ajuste fica a cargo do softInputMode
   * `adjustResize` na janela (app.json), sem componente.
   */
  keyboardAvoiding?: boolean;
  /** Offset vertical do KeyboardAvoidingView no iOS (default: 88 p/ headers custom). */
  keyboardVerticalOffset?: number;
  backgroundColor?: string;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  testID?: string;
  /** Ref da ScrollView (scroll=true) — permite scroll programático. */
  scrollRef?: React.RefObject<ScrollViewType | null>;
  /** Largura máxima do conteúdo em telas grandes (default: 680px no web/tablets). */
  maxContentWidth?: number;
  /**
   * Largura máxima do conteúdo por classe de tamanho (Material 3).
   * Sobrescreve `maxContentWidth` para a classe atual; classes ausentes
   * caem no valor de `maxContentWidth` (default: 680).
   */
  contentWidth?: Partial<Record<SizeClass, number>>;
}

function ScreenContainer({
  children,
  scroll = false,
  padding = true,
  keyboard = true,
  keyboardAvoiding = false,
  keyboardVerticalOffset = 88,
  backgroundColor,
  edges = ['top', 'left', 'right'],
  style,
  contentContainerStyle,
  testID,
  scrollRef,
  maxContentWidth = 680,
  contentWidth,
}: ScreenContainerProps) {
  const { colors } = useAppTheme();
  const sizeClass = useSizeClass();

  const bg = backgroundColor ?? colors.background;
  const paddingValue =
    typeof padding === 'number' ? padding : padding ? sizes.screenPadding : 0;

  // Centered wrapper applies from `medium` upward (>=600dp), closing the
  // 600–768dp gap where tablets like iPad mini (744dp) previously missed the cap.
  const effectiveMaxContentWidth =
    contentWidth?.[sizeClass] ?? maxContentWidth;
  const responsiveWrapperStyle: ViewStyle =
    sizeClass !== 'compact'
      ? {
          width: '100%',
          maxWidth: effectiveMaxContentWidth,
          alignSelf: 'center',
        }
      : { width: '100%' };

  const content = scroll ? (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={[
        styles.scrollContent,
        { padding: paddingValue },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.flex, responsiveWrapperStyle]}>
        {children}
      </View>
    </ScrollView>
  ) : (
    <View
      style={[
        styles.content,
        { padding: paddingValue },
        contentContainerStyle,
      ]}
    >
      <View style={[styles.flex, responsiveWrapperStyle]}>
        {children}
      </View>
    </View>
  );

  const inner = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {content}
    </KeyboardAvoidingView>
  ) : keyboard ? (
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
      style={[styles.safe, { backgroundColor: bg }, style]}
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
