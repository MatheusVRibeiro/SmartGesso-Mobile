import { View, Text, StyleSheet } from 'react-native';

export default function SelectCompanyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>TODO — Selecionar Empresa</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: '#666',
  },
});
