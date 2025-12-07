import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      // Add any global headers here if needed
      return headers;
    },
    credentials: 'include', // Important for cookies
  }),
  tagTypes: [
    'Task',
    'TaskActivity',
    'TaskComment',
    'User',
    'Organization',
    'Department',
    'Material',
    'Vendor',
    'Notification',
    'Attachment',
  ],
  endpoints: () => ({}), // Endpoints injected in other files
});
