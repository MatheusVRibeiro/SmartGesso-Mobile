import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.welcomeCard}>
        <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0]}</Text>
        <Text style={styles.role}>
          {user?.role === 'admin'
            ? 'Administrador'
            : user?.role === 'company_admin'
            ? 'Admin da Empresa'
            : 'Colaborador'}
        </Text>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>--</Text>
          <Text style={styles.metricLabel}>Projetos</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>--</Text>
          <Text style={styles.metricLabel}>Orçamentos</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>--</Text>
          <Text style={styles.metricLabel}>Clientes</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>--</Text>
          <Text style={styles.metricLabel}>Funcionários</Text>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Companies')}
        >
          <Text style={styles.actionButtonText}>Empresas</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.actionButtonText}>Meu Perfil</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  welcomeCard: {
    backgroundColor: colors.primary,
    padding: 24,
    paddingTop: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textOnPrimary,
  },
  role: {
    fontSize: 14,
    color: colors.textOnPrimary,
    opacity: 0.8,
    marginTop: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 0,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  metricLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actionsSection: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  actionButton: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  actionArrow: {
    fontSize: 22,
    color: colors.textSecondary,
  },
  logoutButton: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '600',
  },
});
