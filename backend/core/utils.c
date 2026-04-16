#include "utils.h"
#include <stdlib.h>
#include <math.h>

// helper to init the solution struct
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

// simple check for matrix symmetry
bool check_symmetry(const Matrix* m) {
    int n = m->n;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            // standard float comparison epsilon
            if (fabs(get_dist(m, i, j) - get_dist(m, j, i)) > 1e-9)
                return false;
        }
    }
    return true;
}

// verifying triangle inequality: dist(i,j) + dist(j,k) >= dist(i,k)
bool check_triangle_inequality(const Matrix* m) {
    int n = m->n;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            for (int k = 0; k < n; k++) {
                if (i == j || j == k || i == k) continue;
                if (get_dist(m, i, j) + get_dist(m, j, k) < get_dist(m, i, k) - 1e-9)
                    return false;
            }
        }
    }
    return true;
}

// Prim's algorithm for MST
Edge* get_mst(const Matrix* m, int* edge_count) {
    int n = m->n;
    *edge_count = 0;
    if (n <= 1) return NULL;

    Edge* mst = malloc((n - 1) * sizeof(Edge));
    double* min_weight = malloc(n * sizeof(double));
    int* parent = malloc(n * sizeof(int));
    bool* in_mst = malloc(n * sizeof(bool));

    for (int i = 0; i < n; i++) {
        min_weight[i] = INF;
        parent[i] = -1;
        in_mst[i] = false;
    }

    min_weight[0] = 0.0;

    for (int count = 0; count < n - 1; count++) {
        double min_val = INF;
        int u = -1;

        // find next closest node
        for (int v = 0; v < n; v++) {
            if (!in_mst[v] && min_weight[v] < min_val) {
                min_val = min_weight[v];
                u = v;
            }
        }

        if (u == -1) break;
        in_mst[u] = true;

        // update weights for neighbors
        for (int v = 0; v < n; v++) {
            double weight = get_dist(m, u, v);
            if (!in_mst[v] && weight < min_weight[v]) {
                parent[v] = u;
                min_weight[v] = weight;
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

    // cleanup temp buffers
    free(min_weight);
    free(parent);
    free(in_mst);

    return mst;
}