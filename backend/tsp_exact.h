#ifndef TSP_EXACT_H
#define TSP_EXACT_H

#ifdef __cplusplus
extern "C" {
#endif

#define TSP_INF 1e15

    double tsp_dp(const double* dist_matrix, int n, int* path);

    double tsp_backtracking(const double* dist_matrix, int n, int* path);

#ifdef __cplusplus
}
#endif

#endif