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

    double start = get_time_ms();
    bool* seen = calloc(n, sizeof(bool));
    int curr = 0;

    seen[curr] = true;
    sol.path[0] = curr;
    sol.cost = 0.0;

    for (int step = 1; step < n; step++) {
        int next = -1;
        double min_d = INF;

        for (int i = 0; i < n; i++) {
            if (!seen[i] && get_dist(m, curr, i) < min_d) {
                min_d = get_dist(m, curr, i);
                next = i;
            }
        }

        if (next == -1) break;

        sol.path[step] = next;
        sol.cost += min_d;
        seen[next] = true;
        curr = next;
    }

    sol.cost += get_dist(m, curr, 0);
    sol.success = true;
    sol.time_ms = get_time_ms() - start;

    free(seen);
    return sol;
}

// local stack eulerian to prevent overflow
static void find_eulerian_circuit_iterative(int start_node, int** adj, int* mg_deg, int** edges, int* path, int* p_idx) {
    int* stack = malloc(10000 * sizeof(int));
    int top = 0;
    stack[top++] = start_node;

    while (top > 0) {
        int u = stack[top - 1];
        bool found = false;

        for (int i = 0; i < mg_deg[u]; i++) {
            int v = adj[u][i];
            if (edges[u][v] > 0) {
                edges[u][v]--;
                edges[v][u]--;
                stack[top++] = v;
                found = true;
                break;
            }
        }

        if (!found) {
            path[(*p_idx)++] = u;
            top--;
        }
    }
    free(stack);
}


Solution tsp_christofides(const Matrix* m) {
    int n = m->n;
    Solution sol = create_solution(n);

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

    double t_start = get_time_ms();

    int e_count;
    Edge* mst = get_mst(m, &e_count);
    if (!mst) return sol;

    int* deg = calloc(n, sizeof(int));
    for (int i = 0; i < e_count; i++) {
        deg[mst[i].u]++;
        deg[mst[i].v]++;
    }

    int* odds = malloc(n * sizeof(int));
    int o_cnt = 0;
    for (int i = 0; i < n; i++) {
        if (deg[i] % 2 != 0) odds[o_cnt++] = i;
    }


    bool* matched = calloc(o_cnt, sizeof(bool));
    Edge* match_edges = malloc((o_cnt / 2) * sizeof(Edge));
    int m_idx = 0;

    for (int i = 0; i < o_cnt; i++) {
        if (matched[i]) continue;
        int best_j = -1;
        double min_val = INF;

        for (int j = i + 1; j < o_cnt; j++) {
            if (!matched[j]) {
                double d = get_dist(m, odds[i], odds[j]);
                if (d < min_val) { min_val = d; best_j = j; }
            }
        }
        if (best_j != -1) {
            matched[i] = matched[best_j] = true;
            match_edges[m_idx].u = odds[i];
            match_edges[m_idx].v = odds[best_j];
            m_idx++;
        }
    }


    int** adj = malloc(n * sizeof(int*));
    int* mg_deg = calloc(n, sizeof(int));
    int** edge_map = malloc(n * sizeof(int*));

    for (int i = 0; i < n; i++) {
        adj[i] = malloc((n * 2) * sizeof(int));
        edge_map[i] = calloc(n, sizeof(int));
    }

    for (int i = 0; i < e_count; i++) {
        int u = mst[i].u, v = mst[i].v;
        adj[u][mg_deg[u]++] = v; adj[v][mg_deg[v]++] = u;
        edge_map[u][v]++; edge_map[v][u]++;
    }

    for (int i = 0; i < m_idx; i++) {
        int u = match_edges[i].u, v = match_edges[i].v;
        adj[u][mg_deg[u]++] = v; adj[v][mg_deg[v]++] = u;
        edge_map[u][v]++; edge_map[v][u]++;
    }

    int* e_path = malloc((e_count + m_idx + 1) * sizeof(int));
    int e_idx = 0;
    find_eulerian_circuit_iterative(0, adj, mg_deg, edge_map, e_path, &e_idx);


    // shortcut to hamiltonian
    bool* seen = calloc(n, sizeof(bool));
    int s_idx = 0;
    for (int i = e_idx - 1; i >= 0; i--) {
        if (!seen[e_path[i]]) {
            sol.path[s_idx++] = e_path[i];
            seen[e_path[i]] = true;
        }
    }

    sol.cost = 0.0;
    for (int i = 0; i < n; i++)
        sol.cost += get_dist(m, sol.path[i], sol.path[(i + 1) % n]);

    sol.success = true;
    sol.time_ms = get_time_ms() - t_start;

    for (int i = 0; i < n; i++) { free(adj[i]); free(edge_map[i]); }
    free(adj); free(edge_map); free(mg_deg); free(deg); free(odds);
    free(matched); free(match_edges); free(mst); free(seen); free(e_path);

    return sol;
}