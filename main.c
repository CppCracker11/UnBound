#include <stdio.h>
#include <stdlib.h>
#include "tsp_exact.h"

void print_results(const char* algo_name, double cost, int* path, int n) {
    printf("=== %s ===\n", algo_name);
    if (cost >= TSP_INF) {
        printf("Error: No valid path found or memory failure.\n\n");
        return;
    }

    printf("Minimum Cost: %.2f\n", cost);
    printf("Optimal Path: ");
    for (int i = 0; i < n; i++) {
        printf("%d -> ", path[i]);
    }
    printf("0\n\n"); // Show the return to start
}

int main() {
    int n = 5;

    // A standard 4-city graph.
    // Expected optimal route: 0 -> 1 -> 3 -> 2 -> 0. Cost: 80.00
    double dist_matrix[] = {
        0, 10, 15, 20, 30,
       10,  0, 35, 25, 50,
       15, 35,  0, 30, 10,
       20, 25, 30,  0, 2,
   };

    // Allocate memory for the result paths
    int* path_dp = (int*)malloc(n * sizeof(int));
    int* path_bt = (int*)malloc(n * sizeof(int));

    // Run DP
    double cost_dp = tsp_dp(dist_matrix, n, path_dp);
    print_results("Dynamic Programming", cost_dp, path_dp, n);

    // Run Backtracking
    double cost_bt = tsp_backtracking(dist_matrix, n, path_bt);
    print_results("Backtracking (Branch & Bound)", cost_bt, path_bt, n);

    // Cleanup
    free(path_dp);
    free(path_bt);

    return 0;
}