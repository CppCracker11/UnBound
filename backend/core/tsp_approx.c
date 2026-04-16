#include "tsp_approx.h"
#include "utils.h"
#include <stdlib.h>
#include <string.h>

#ifdef _WIN32
#include <windows.h>
static double get_time_ms() {
    LARGE_INTEGER freq, val;
    QueryPerformanceFrequency(&freq);
    QueryPerformanceCounter(&val);
    return (double)val.QuadPart * 1000.0 / (double)freq.QuadPart;
}
#else
#include <time.h>
static double get_time_ms() {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return ts.tv_sec * 1000.0 + ts.tv_nsec / 1000000.0;
}
#endif

Solution tsp_greedy(const Matrix* m) {
    int n = m->n;
    Solution sol = create_solution(n);
    double start_time = get_time_ms();

    bool* visited = (bool*)calloc(n, sizeof(bool));
    int curr = 0;
    visited[curr] = true;
    sol.path[0] = curr;
    sol.cost = 0.0;

    for (int step = 1; step < n; step++) {
        int next_node = -1;
        double min_dist = INF;

        for (int i = 0; i < n; i++) {
            if (!visited[i] && get_dist(m, curr, i) < min_dist) {
                min_dist = get_dist(m, curr, i);
                next_node = i;
            }
        }

        if (next_node == -1) break;

        sol.path[step] = next_node;
        sol.cost += min_dist;
        visited[next_node] = true;
        curr = next_node;
    }

    sol.cost += get_dist(m, curr, 0);
    sol.success = true;
    sol.time_ms = get_time_ms() - start_time;

    free(visited);
    return sol;
}

// Edge-Tracking Eulerian Circuit Helper
static void find_eulerian_circuit(int u, int** adj, int* mg_degree, int** edge_exists, int* path, int* path_idx) {
    for (int v_idx = 0; v_idx < mg_degree[u]; v_idx++) {
        int v = adj[u][v_idx];
        if (edge_exists[u][v] > 0) {
            edge_exists[u][v]--; // Consume one edge
            edge_exists[v][u]--; // Symmetric consumption
            find_eulerian_circuit(v, adj, mg_degree, edge_exists, path, path_idx);
        }
    }
    path[(*path_idx)++] = u; // Add to path on backtrack
}

Solution tsp_christofides(const Matrix* m) {
    int n = m->n;
    Solution sol = create_solution(n);
    double start_time = get_time_ms();

    int edge_count;
    Edge* mst = get_mst(m, &edge_count);
    if (!mst) return sol;

    int* degree = (int*)calloc(n, sizeof(int));
    for (int i = 0; i < edge_count; i++) {
        degree[mst[i].u]++;
        degree[mst[i].v]++;
    }

    int* odds = (int*)malloc(n * sizeof(int));
    int odd_count = 0;
    for (int i = 0; i < n; i++) {
        if (degree[i] % 2 != 0) odds[odd_count++] = i;
    }

    // GREEDY MATCHING
    bool* matched = (bool*)calloc(odd_count, sizeof(bool));
    int match_idx = 0;
    Edge* matching = (Edge*)malloc((odd_count / 2) * sizeof(Edge));

    for (int i = 0; i < odd_count; i++) {
        if (matched[i]) continue;
        int best_j = -1;
        double min_d = INF;
        for (int j = i + 1; j < odd_count; j++) {
            if (!matched[j]) {
                double d = get_dist(m, odds[i], odds[j]);
                if (d < min_d) { min_d = d; best_j = j; }
            }
        }
        if (best_j != -1) {
            matched[i] = true;
            matched[best_j] = true;
            matching[match_idx].u = odds[i];
            matching[match_idx].v = odds[best_j];
            matching[match_idx].weight = min_d;
            match_idx++;
        }
    }

    // BUILD MULTIGRAPH
    int** adj = (int**)malloc(n * sizeof(int*));
    int* mg_degree = (int*)calloc(n, sizeof(int));
    int** edge_exists = (int**)malloc(n * sizeof(int*));
    for (int i = 0; i < n; i++) {
        adj[i] = (int*)malloc((n * 2) * sizeof(int)); // Capacity for multigraph
        edge_exists[i] = (int*)calloc(n, sizeof(int));
    }

    // Add MST edges
    for (int i = 0; i < edge_count; i++) {
        int u = mst[i].u;
        int v = mst[i].v;
        adj[u][mg_degree[u]++] = v;
        adj[v][mg_degree[v]++] = u;
        edge_exists[u][v]++;
        edge_exists[v][u]++;
    }

    // Add Matching edges
    for (int i = 0; i < match_idx; i++) {
        int u = matching[i].u;
        int v = matching[i].v;
        adj[u][mg_degree[u]++] = v;
        adj[v][mg_degree[v]++] = u;
        edge_exists[u][v]++;
        edge_exists[v][u]++;
    }

    // FIND EULERIAN CIRCUIT
    int* euler_path = (int*)malloc((edge_count + match_idx + 1) * sizeof(int));
    int euler_idx = 0;
    find_eulerian_circuit(0, adj, mg_degree, edge_exists, euler_path, &euler_idx);

    // SHORTCUTTING (Eulerian -> Hamiltonian)
    bool* visited = (bool*)calloc(n, sizeof(bool));
    int sol_idx = 0;
    for (int i = euler_idx - 1; i >= 0; i--) {
        if (!visited[euler_path[i]]) {
            sol.path[sol_idx++] = euler_path[i];
            visited[euler_path[i]] = true;
        }
    }

    // FINAL COST CALCULATION
    sol.cost = 0.0;
    for (int i = 0; i < n; i++) {
        sol.cost += get_dist(m, sol.path[i], sol.path[(i + 1) % n]);
    }

    sol.success = true;
    sol.time_ms = get_time_ms() - start_time;

    // CLEANUP
    for (int i = 0; i < n; i++) { free(adj[i]); free(edge_exists[i]); }
    free(adj); free(edge_exists); free(mg_degree); free(degree); free(odds);
    free(matched); free(matching); free(mst); free(visited); free(euler_path);

    return sol;
}