// File: backend/core/common.h

#ifndef UNBOUND_COMMON_H
#define UNBOUND_COMMON_H

#include <stdbool.h>
#include <stdint.h>
#include <stddef.h>

// --- GLOBALS & SAFETY LIMITS ---
#define INF 1e18
#define MAX_NODES_DP 22   // Hard cap for 2^N memory allocation
#define MAX_NODES_BT 15   // Hard cap for N! time complexity

// --- DATA STRUCTURES ---

// The primary input structure. 
// Passed as a flattened 1D array to optimize CPU caching.
typedef struct {
    double* data;       // Flattened N x N adjacency matrix
    int n;              // Number of cities
    bool is_metric;     // True if it satisfies Triangle Inequality
    bool is_symmetric;  // True if Dist(A,B) == Dist(B,A)
} Matrix;

// The universal output structure. 
// Every algorithm (Exact or Approx) MUST return this.
typedef struct {
    double cost;        // Total path distance
    int* path;          // Array containing the sequence of node indices
    int n;              // Number of cities in the path
    double time_ms;     // High-precision execution time
    bool success;       // True if solved, False if an error occurred (e.g., N too large)
} Solution;

// The output structure for the Pre-Flight Diagnostic Module.
typedef struct {
    bool is_symmetric;
    bool triangle_inequality;
    char recommendation[256]; // String recommending the best algorithm
    double est_time_dp_ms;    // Estimated time if run on DP
    double est_time_bt_ms;    // Estimated time if run on Backtracking
} DiagnosticReport;

#endif // UNBOUND_COMMON_H