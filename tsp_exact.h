#ifndef TSP_EXACT_H
#define TSP_EXACT_H

#ifdef __cplusplus
extern "C" {
#endif

    /**
     * Solves the TSP using Bitmask Dynamic Programming.
     * Time: O(N^2 * 2^N) | Space: O(N * 2^N)
     * * @param dist_matrix A 1D array of size N*N representing the adjacency matrix.
     * @param n The number of cities.
     * @return The minimum cost, or -1.0 if memory allocation fails.
     */
    double tsp_dp(const double* dist_matrix, int n);

    /**
     * Solves the TSP using Branch and Bound Backtracking.
     * Time: O(N!) (heavily pruned) | Space: O(N) auxiliary stack
     * * @param dist_matrix A 1D array of size N*N representing the adjacency matrix.
     * @param n The number of cities.
     * @return The minimum cost.
     */
    double tsp_backtracking(const double* dist_matrix, int n);

#ifdef __cplusplus
}
#endif

#endif // TSP_EXACT_H