/**
 * RTK Query Hook Re-exports
 * 화면 컴포넌트는 이 파일에서 hook을 import한다.
 */

// Table
export { useGetTablesQuery, useSelectTableMutation } from './tableApi';

// Order / Menu
export { useGetMenuQuery, useGetOrderQuery, useAddOrderItemMutation } from './orderApi';

// System
export { useGetBootstrapDataQuery } from './systemApi';

// Auth
export { useLoginMutation, useLogoutMutation } from './authApi';

// MealTicket (RFID 식권)
export { useLookupBadgeMutation, useAuthorizeMealTicketMutation } from './mealTicketApi';
