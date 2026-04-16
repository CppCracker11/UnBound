// File: backend/core/utils.h

#ifndef UNBOUND_UTILS_H
#define UNBOUND_UTILS_H

#include "common.h"

// --- MEMORY MANAGEMENT ---
// Safely allocates memory for a Solution struct and its internal path array.
Solution create_solution(int n);

// Safely frees the memory allocated inside a Solution struct to prevent memory leaks.
void free_solution(Solution* sol);


// --- MATRIX HELPERS ---
// Inline helper to get a value from a 1D flattened matrix as if it were 2D.
// Using inline here prevents function-call overhead in tight loops (like N!).
static inline double get_dist(const Matrix* m, int row, int col) {
    return m->data[row * m->n + col];
}


// --- GRAPH PROPERTIES ---
// Returns true if the matrix is completely symmetric.
bool check_symmetry(const Matrix* m);

// Returns true if all points satisfy Dist(A,B) + Dist(B,C) >= Dist(A,C).
// Critical for the Christofides 1.5x approximation guarantee.
bool check_triangle_inequality(const Matrix* m);


// --- MINIMUM SPANNING TREE (MST) ---
// Used primarily by the Christofides algorithm.
typedef struct {
    int u;
    int v;
    double weight;
} Edge;

// Computes the MST using Prim's or Kruskal's algorithm.
// Allocates and returns an array of Edges. Sets edge_count to (N-1).
// The caller is responsible for freeing the returned pointer.
Edge* get_mst(const Matrix* m, int* edge_count);

#endif // UNBOUND_UTILS_H