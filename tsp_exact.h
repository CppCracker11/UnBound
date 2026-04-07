#ifndef TSP_EXACT_H
#define TSP_EXACT_H

#ifdef __cplusplus
extern "C" {
#endif

    // Safe Infinity to prevent overflow when adding distances
#define TSP_INF 1e15

    /**
     * Solves TSP using Bitmask Dynamic Programming.
     * @param dist_matrix 1D array of size N*N (Row-Major).
     * @param n Number of cities (Max 30 for 32-bit int masks).
     * @param path Pre-allocated array of size N to store the optimal route.
     * @return The minimum cost, or -1.0 if memory fails.
     */
    double tsp_dp(const double* dist_matrix, int n, int* path);

    /**
     * Solves TSP using Branch and Bound Backtracking.
     * @param dist_matrix 1D array of size N*N (Row-Major).
     * @param n Number of cities.
     * @param path Pre-allocated array of size N to store the optimal route.
     * @return The minimum cost.
     */
    double tsp_backtracking(const double* dist_matrix, int n, int* path);

#ifdef __cplusplus
}
#endif

#endif // TSP_EXACT_H