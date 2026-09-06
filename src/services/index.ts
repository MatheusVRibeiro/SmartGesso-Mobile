export {
  createApiClient,
  getApiClient,
  toApiError,
  setUnauthorizedHandler,
  setAccessDeniedHandler,
} from './api/client';

export { authService } from './api/auth';
export { companyService } from './api/companies';
export { companyMembersService } from './api/companyMembers';
export { clientsService } from './api/clients';
export { worksService } from './api/works';
export { catalogService } from './api/catalog';
export { measurementsService } from './api/measurements';
export { compositionsService } from './api/compositions';
export { quotesService } from './api/quotes';
export { quoteEnvironmentsService } from './api/quoteEnvironments';
export { serviceOrdersService } from './api/serviceOrders';
export { serviceAdditionalsService } from './api/serviceAdditionals';
export { productionOrdersService } from './api/productionOrders';
export { paymentsService } from './api/payments';
export { expensesService } from './api/expenses';
export { dashboardService } from './api/dashboard';
export { cepService, fetchAddressByCep } from './api/cep';
export type { CepAddress } from './api/cep';

export { SecureTokenStorage } from './auth/SecureTokenStorage';

export {
  loadNotifications,
  countNotifications,
  registerForPushNotifications,
} from './notifications';
export type { Notificacao, NotificationType } from '../types/notification';

export { useSessionStore } from '../store/useSessionStore';
export type { SessionState } from '../store/useSessionStore';
