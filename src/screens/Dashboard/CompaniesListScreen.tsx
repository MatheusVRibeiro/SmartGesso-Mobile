import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../constants/colors';
import { Company } from '../../types/company';
import { companyApi } from '../../api/companies';

export default function CompaniesListScreen() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function fetchCompanies(pageNum: number, refresh = false) {
    try {
      const response = await companyApi.list(pageNum);
      if (refresh || pageNum === 1) {
        setCompanies(response.data);
      } else {
        setCompanies((prev) => [...prev, ...response.data]);
      }
      setTotalPages(response.totalPages || 1);
      setPage(pageNum);
    } catch {
      // Error state could be handled with a shared component
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    fetchCompanies(1);
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchCompanies(1, true);
  }, []);

  function loadMore() {
    if (page < totalPages && !isLoading) {
      fetchCompanies(page + 1);
    }
  }

  function renderCompany({ item }: { item: Company }) {
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.statusDot,
              item.isActive ? styles.activeDot : styles.inactiveDot,
            ]}
          />
          <Text style={styles.companyName}>{item.name}</Text>
        </View>

        {item.cnpj ? (
          <Text style={styles.companyInfo}>
            CNPJ: {item.cnpj}
          </Text>
        ) : null}

        {item.email ? (
          <Text style={styles.companyInfo}>{item.email}</Text>
        ) : null}

        {item.phone ? (
          <Text style={styles.companyInfo}>{item.phone}</Text>
        ) : null}

        {item.address ? (
          <Text style={styles.companyInfo}>
            {item.address.city}, {item.address.state}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  }

  if (isLoading && companies.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando empresas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={companies}
        keyExtractor={(item) => item.id}
        renderItem={renderCompany}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>Nenhuma empresa encontrada</Text>
          </View>
        }
        ListFooterComponent={
          page < totalPages ? (
            <ActivityIndicator
              style={styles.footer}
              color={colors.primary}
              size="small"
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: colors.success,
  },
  inactiveDot: {
    backgroundColor: colors.disabled,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  companyInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 16,
  },
  footer: {
    paddingVertical: 16,
  },
});
