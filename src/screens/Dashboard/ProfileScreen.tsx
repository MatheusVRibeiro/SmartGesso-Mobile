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

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  function getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      company_admin: 'Admin da Empresa',
      manager: 'Gerente',
      employee: 'Colaborador',
    };
    return labels[role] || role;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userRole}>{getRoleLabel(user?.role || '')}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Informações do Perfil</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>E-mail</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cargo</Text>
          <Text style={styles.infoValue}>
            {getRoleLabel(user?.role || '')}
          </Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Sistema</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Versão</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Conta criada em</Text>
          <Text style={styles.infoValue}>
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString('pt-BR')
              : '--'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  avatarSection: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.primary,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textOnPrimary,
  },
  userRole: {
    fontSize: 14,
    color: colors.textOnPrimary,
    opacity: 0.8,
    marginTop: 4,
  },
  infoSection: {
    backgroundColor: colors.surface,
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  logoutButton: {
    margin: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '600',
  },
});
