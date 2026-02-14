import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";

export const portfolioApi = createApi({
  reducerPath: "portfolioApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Portfolio"],
  endpoints: (builder) => ({
    // Get all portfolios
    getPortfolios: builder.query({
      query: (userId) => `/users/${userId}/portfolio`,
      providesTags: ["Portfolio"],
    }),

    // Create portfolio
    createPortfolio: builder.mutation({
      query: (data) => ({
        url: "/user/portfolio",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Portfolio"],
    }),

    // Update portfolio
    updatePortfolio: builder.mutation({
      query: ({ portfolioId, data }) => ({
        url: `/user/portfolio/${portfolioId}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response) => ({
        ...response,
        message: "Portfolio updated successfully",
      }),
      transformErrorResponse: (response) => ({
        status: response.status,
        message: "Failed to update portfolio. Please try again.",
      }),
      invalidatesTags: ["Portfolio"],
    }),

    // Delete portfolio
    deletePortfolio: builder.mutation({
      query: (portfolioId) => ({
        url: `/user/portfolio/${portfolioId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Portfolio"],
    }),
  }),
});

export const {
  useGetPortfoliosQuery,
  useCreatePortfolioMutation,
  useUpdatePortfolioMutation,
  useDeletePortfolioMutation,
} = portfolioApi;
