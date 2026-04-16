#include "tsp_exact.h"
#include "utils.h"
#include <stdlib.h>
#include <omp.h>

// Held-Karp using DP
Solution tsp_dp(const Matrix* m) {
    int n = m->n;
    Solution sol = create_solution(n);
    if (n > MAX_NODES_DP) return sol;

    // Trivial edge cases to prevent engine crash
    if (n <= 1) {
        sol.cost = 0;
        if (n == 1) sol.path[0] = 0;
        sol.success = true;
        return sol;
    }
    if (n == 2) {
        sol.path[0] = 0;
        sol.path[1] = 1;
        sol.cost = get_dist(m, 0, 1) * 2; // out and back
        sol.success = true;
        return sol;
    }

    double start = omp_get_wtime();

    // safe bitshift for 32+ nodes
    unsigned long long num_states = 1ULL << n;

    double* dp = malloc(num_states * n * sizeof(double));
    int* parent = malloc(num_states * n * sizeof(int));

    for (int i = 0; i < num_states * n; i++) {
        dp[i] = INF;
        parent[i] = -1;
    }

    dp[1 * n + 0] = 0;

    for (int mask = 1; mask < num_states; mask += 2) {
        for (int u = 0; u < n; u++) {
            if (!(mask & (1 << u))) continue;
            if (dp[mask * n + u] >= INF) continue;

            for (int v = 1; v < n; v++) {
                if (mask & (1 << v)) continue;

                int next_mask = mask | (1 << v);
                double new_cost = dp[mask * n + u] + get_dist(m, u, v);

                if (new_cost < dp[next_mask * n + v]) {
                    dp[next_mask * n + v] = new_cost;
                    parent[next_mask * n + v] = u;
                }
            }
        }
    }

    double min_cost = INF;
    int last_node = -1;
    int full_mask = num_states - 1;

    // close the loop
    for (int i = 1; i < n; i++) {
        double cost = dp[full_mask * n + i] + get_dist(m, i, 0);
        if (cost < min_cost) {
            min_cost = cost;
            last_node = i;
        }
    }

    sol.cost = min_cost;

    if (last_node != -1) {
        int curr_mask = full_mask;
        int curr_node = last_node;

        for (int i = n - 1; i > 0; i--) {
            sol.path[i] = curr_node;
            int prev_node = parent[curr_mask * n + curr_node];
            curr_mask ^= (1 << curr_node);
            curr_node = prev_node;
        }
        sol.path[0] = 0;
        sol.success = true;
    }

    free(dp);
    free(parent);

    sol.time_ms = (omp_get_wtime() - start) * 1000.0;
    return sol;
}

void tsp_bt_util(const Matrix* m, int curr, int count, double cost, int* path, double* min_cost, int* best_path, int* visited) {
    if (count == m->n) {
        double final_cost = cost + get_dist(m, curr, 0);
        if (final_cost < *min_cost) {
            *min_cost = final_cost;
            for (int i = 0; i < m->n; i++) best_path[i] = path[i];
        }
        return;
    }

    for (int i = 1; i < m->n; i++) {
        if (!visited[i]) {
            // prune bad paths early
            if (cost + get_dist(m, curr, i) >= *min_cost) continue;

            visited[i] = 1;
            path[count] = i;

            tsp_bt_util(m, i, count + 1, cost + get_dist(m, curr, i), path, min_cost, best_path, visited);

            visited[i] = 0;
        }
    }
}

// parallelized backtracking
Solution tsp_backtracking_parallel(const Matrix* m) {
    int n = m->n;
    Solution sol = create_solution(n);
    if (n > MAX_NODES_BT) return sol;

    if (n <= 1) {
        sol.cost = 0;
        if (n == 1) sol.path[0] = 0;
        sol.success = true;
        return sol;
    }
    if (n == 2) {
        sol.path[0] = 0;
        sol.path[1] = 1;
        sol.cost = get_dist(m, 0, 1) * 2;
        sol.success = true;
        return sol;
    }

    double start = omp_get_wtime();
    double global_min = INF;
    int* global_best_path = malloc(n * sizeof(int));

    #pragma omp parallel for schedule(dynamic)
    for (int i = 1; i < n; i++) {
        double local_min = INF;
        int* local_path = malloc(n * sizeof(int));
        int* local_best = malloc(n * sizeof(int));
        int* visited = calloc(n, sizeof(int));

        local_path[0] = 0;
        local_path[1] = i;
        visited[0] = 1;
        visited[i] = 1;

        tsp_bt_util(m, i, 2, get_dist(m, 0, i), local_path, &local_min, local_best, visited);

        #pragma omp critical
        {
            if (local_min < global_min) {
                global_min = local_min;
                for (int j = 0; j < n; j++) global_best_path[j] = local_best[j];
            }
        }

        free(local_path);
        free(local_best);
        free(visited);
    }

    if (global_min < INF) {
        sol.cost = global_min;
        for (int i = 0; i < n; i++) sol.path[i] = global_best_path[i];
        sol.success = true;
    }

    free(global_best_path);
    sol.time_ms = (omp_get_wtime() - start) * 1000.0;
    return sol;
}