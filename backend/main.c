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
    printf("0\n\n"); 
}

int main() {
    int n = 5;

    double dist_matrix[] = {
        0, 10, 15, 20, 30,
       10,  0, 35, 25, 50,
       15, 35,  0, 30, 10,
       20, 25, 30,  0, 2,
   };

    int* path_dp = (int*)malloc(n * sizeof(int));
    int* path_bt = (int*)malloc(n * sizeof(int));

    double cost_dp = tsp_dp(dist_matrix, n, path_dp);
    print_results("Dynamic Programming", cost_dp, path_dp, n);

    double cost_bt = tsp_backtracking(dist_matrix, n, path_bt);
    print_results("Backtracking (Branch & Bound)", cost_bt, path_bt, n);

    free(path_dp);
    free(path_bt);

    return 0;
}