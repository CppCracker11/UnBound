#include "tsp_exact.h"
#include <stdlib.h>
#include <string.h>
#include <stdio.h>

#define DIST(i, j) dist_matrix[(i) * n + (j)]

double tsp_dp(const double* dist_matrix, int n, int* path) {
    if (n <= 1) {
        if (n == 1) path[0] = 0;
        return 0.0;
    }

    int num_states = 1 << n;

    double* memo = (double*)malloc((size_t)num_states * n * sizeof(double));
    int* parent = (int*)malloc((size_t)num_states * n * sizeof(int));

    if (!memo || !parent) {
        if (memo) free(memo);
        if (parent) free(parent);
        return -1.0;
    }

    for (int i = 0; i < num_states * n; i++) {
        memo[i] = TSP_INF;
        parent[i] = -1;
    }

    memo[1 * n + 0] = 0.0;

    for (int mask = 1; mask < num_states; mask++) {
        for (int u = 0; u < n; u++) {
            if (!(mask & (1 << u)) || memo[mask * n + u] >= TSP_INF) continue;

            for (int v = 0; v < n; v++) {
                if (!(mask & (1 << v))) {
                    int next_mask = mask | (1 << v);
                    double new_cost = memo[mask * n + u] + DIST(u, v);

                    if (new_cost < memo[next_mask * n + v]) {
                        memo[next_mask * n + v] = new_cost;
                        parent[next_mask * n + v] = u;
                    }
                }
            }
        }
    }

    double min_cost = TSP_INF;
    int best_last_node = -1;
    int full_mask = num_states - 1;

    for (int i = 1; i < n; i++) {
        double current_cost = memo[full_mask * n + i] + DIST(i, 0);
        if (current_cost < min_cost) {
            min_cost = current_cost;
            best_last_node = i;
        }
    }

    if (best_last_node != -1) {
        int curr_mask = full_mask;
        int curr_node = best_last_node;

        for (int i = n - 1; i > 0; i--) {
            path[i] = curr_node;
            int prev_node = parent[curr_mask * n + curr_node];
            curr_mask ^= (1 << curr_node);
            curr_node = prev_node;
        }
        path[0] = 0;
    }

    free(memo);
    free(parent);
    return min_cost;
}

static void backtrack_util(const double* dist_matrix, int n, int curr_node, int mask,
                           int count, double current_cost, double* global_min,
                           int* curr_path, int* best_path) {

    if (current_cost >= *global_min) return;

    if (count == n) {
        double final_cost = current_cost + DIST(curr_node, 0);
        if (final_cost < *global_min) {
            *global_min = final_cost;
            memcpy(best_path, curr_path, n * sizeof(int));
        }
        return;
    }

    for (int v = 0; v < n; v++) {
        if (!(mask & (1 << v))) {
            curr_path[count] = v;
            backtrack_util(dist_matrix, n, v, mask | (1 << v), count + 1,
                           current_cost + DIST(curr_node, v), global_min,
                           curr_path, best_path);
        }
    }
}

double tsp_backtracking(const double* dist_matrix, int n, int* path) {
    if (n <= 1) {
        if (n == 1) path[0] = 0;
        return 0.0;
    }

    double global_min = TSP_INF;

    int* curr_path = (int*)malloc(n * sizeof(int));
    if (!curr_path) return -1.0;

    curr_path[0] = 0;

    backtrack_util(dist_matrix, n, 0, 1, 1, 0.0, &global_min, curr_path, path);

    free(curr_path);
    return global_min;
}