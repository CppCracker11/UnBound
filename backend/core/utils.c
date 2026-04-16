#include "utils.h"
#include <stdlib.h>
#include <math.h>

Solution create_solution(int n) {
    Solution sol;
    sol.n = n;
    sol.cost = INF;
    sol.time_ms = 0.0;
    sol.success = false;
    sol.path = (int*)malloc(n * sizeof(int));
    return sol;
}

void free_solution(Solution* sol) {
    if (sol && sol->path) {
        free(sol->path);
        sol->path = NULL;
    }
}

bool check_symmetry(const Matrix* m) {
    for (int i = 0; i < m->n; i++) {
        for (int j = 0; j < m->n; j++) {
            if (fabs(get_dist(m, i, j) - get_dist(m, j, i)) > 1e-9) {
                return false;
            }
        }
    }
    return true;
}

bool check_triangle_inequality(const Matrix* m) {
    for (int i = 0; i < m->n; i++) {
        for (int j = 0; j < m->n; j++) {
            for (int k = 0; k < m->n; k++) {
                if (i == j || j == k || i == k) continue;
                if (get_dist(m, i, j) + get_dist(m, j, k) < get_dist(m, i, k) - 1e-9) {
                    return false;
                }
            }
        }
    }
    return true;
}

Edge* get_mst(const Matrix* m, int* edge_count) {
    int n = m->n;
    *edge_count = 0;
    if (n <= 1) return NULL;

    Edge* mst = (Edge*)malloc((n - 1) * sizeof(Edge));
    double* min_weight = (double*)malloc(n * sizeof(double));
    int* parent = (int*)malloc(n * sizeof(int));
    bool* in_mst = (bool*)malloc(n * sizeof(bool));

    for (int i = 0; i < n; i++) {
        min_weight[i] = INF;
        parent[i] = -1;
        in_mst[i] = false;
    }

    min_weight[0] = 0.0;

    for (int count = 0; count < n - 1; count++) {
        double min = INF;
        int u = -1;

        for (int v = 0; v < n; v++) {
            if (!in_mst[v] && min_weight[v] < min) {
                min = min_weight[v];
                u = v;
            }
        }

        if (u == -1) break;
        in_mst[u] = true;

        for (int v = 0; v < n; v++) {
            if (!in_mst[v]) {
                double weight = get_dist(m, u, v);
                if (weight < min_weight[v]) {
                    parent[v] = u;
                    min_weight[v] = weight;
                }
            }
        }
    }

    int idx = 0;
    for (int i = 1; i < n; i++) {
        if (parent[i] != -1) {
            mst[idx].u = parent[i];
            mst[idx].v = i;
            mst[idx].weight = get_dist(m, parent[i], i);
            idx++;
        }
    }

    *edge_count = idx;
    free(min_weight);
    free(parent);
    free(in_mst);
    return mst;
}