#include "tsp_exact.h"
#include <stdlib.h>
#include <float.h>

// Macro to easily index the 1D array as a 2D matrix
#define DIST(i, j) dist_matrix[(i) * n + (j)]

// ==========================================
// 1. DYNAMIC PROGRAMMING ENGINE
// ==========================================
double tsp_dp(const double* dist_matrix, int n) {
    if (n <= 1) return 0.0;

    int num_states = 1 << n;
    
    // Allocate a single contiguous block for the DP table for cache efficiency.
    // Table represents: memo[mask][last_node]
    double* memo = (double*)malloc((size_t)num_states * n * sizeof(double));
    if (!memo) {
        return -1.0; // Safe exit if RAM is exhausted
    }

    // Initialize with infinity
    for (int i = 0; i < num_states * n; i++) {
        memo[i] = DBL_MAX;
    }

    // Base case: Starting at node 0. Mask = 1 (only 0th bit set).
    memo[1 * n + 0] = 0.0; 

    // Iterative DP Table filling
    for (int mask = 1; mask < num_states; mask++) {
        for (int u = 0; u < n; u++) {
            // If node 'u' is in the current mask
            if (mask & (1 << u)) {
                // Try to transition to an unvisited node 'v'
                for (int v = 0; v < n; v++) {
                    if (!(mask & (1 << v))) {
                        int next_mask = mask | (1 << v);
                        double new_cost = memo[mask * n + u] + DIST(u, v);
                        
                        // Relaxation
                        if (new_cost < memo[next_mask * n + v]) {
                            memo[next_mask * n + v] = new_cost;
                        }
                    }
                }
            }
        }
    }

    // Find the minimum cost to return to the starting node (0)
    double min_cost = DBL_MAX;
    int full_mask = num_states - 1;
    
    for (int i = 1; i < n; i++) {
        double cost = memo[full_mask * n + i] + DIST(i, 0);
        if (cost < min_cost) {
            min_cost = cost;
        }
    }

    // Crucial: Free the allocated heap memory to prevent leaks
    free(memo); 
    return min_cost;
}

// ==========================================
// 2. BACKTRACKING ENGINE
// ==========================================

// Struct used for sorting edges to optimize pruning
typedef struct {
    double dist;
    int node;
} Edge;

// Comparator for qsort (Greedy heuristic)
static int compare_edges(const void* a, const void* b) {
    double d1 = ((Edge*)a)->dist;
    double d2 = ((Edge*)b)->dist;
    return (d1 > d2) - (d1 < d2); // Safe float comparison
}

static void backtrack_util(const double* dist_matrix, int n, int curr_node, int mask, int count, double current_cost, double* global_min) {
    // Branch and Bound: Prune immediately if current path is worse than the best known
    if (current_cost >= *global_min) {
        return;
    }

    // Base Case: All cities visited
    if (count == n) {
        double final_cost = current_cost + DIST(curr_node, 0);
        if (final_cost < *global_min) {
            *global_min = final_cost;
        }
        return;
    }

    // Greedy sorting heuristic: Explore closest unvisited neighbors first.
    // Using a VLA (Variable Length Array) ensures this stays entirely on the stack.
    Edge edges[n];
    int e_count = 0;

    for (int v = 0; v < n; v++) {
        if (!(mask & (1 << v))) {
            edges[e_count].dist = DIST(curr_node, v);
            edges[e_count].node = v;
            e_count++;
        }
    }

    // Sort to visit closest cities first, triggering the pruning condition earlier on subsequent paths
    qsort(edges, e_count, sizeof(Edge), compare_edges);

    for (int i = 0; i < e_count; i++) {
        int next_node = edges[i].node;
        backtrack_util(dist_matrix, n, next_node, mask | (1 << next_node), count + 1, current_cost + edges[i].dist, global_min);
    }
}

double tsp_backtracking(const double* dist_matrix, int n) {
    if (n <= 1) return 0.0;
    
    double global_min = DBL_MAX;
    // Start at node 0, having visited just node 0 (mask = 1), count = 1
    backtrack_util(dist_matrix, n, 0, 1, 1, 0.0, &global_min);
    
    return global_min;
}