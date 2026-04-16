#include "diagnostic.h"
#include "utils.h"
#include <string.h>
#include <stdio.h>

static double estimate_factorial(int n) {
    double res = 1.0;
    for (int i = 2; i <= n; i++) res *= i;
    return res;
}

DiagnosticReport run_diagnostics(const Matrix* m) {
    DiagnosticReport rep;
    rep.is_symmetric = check_symmetry(m);
    rep.triangle_inequality = check_triangle_inequality(m);
    
    double ops_dp = (double)(m->n * m->n) * (double)(1ULL << m->n);
    rep.est_time_dp_ms = ops_dp / 50000.0; 
    
    if (m->n <= MAX_NODES_BT) {
        rep.est_time_bt_ms = estimate_factorial(m->n) / 100000.0;
    } else {
        rep.est_time_bt_ms = INF;
    }

    if (m->n <= 12) {
        snprintf(rep.recommendation, 256, "N=%d. Size is small. Use DP or Parallel Backtracking for an exact optimal solution.", m->n);
    } else if (m->n <= MAX_NODES_DP) {
        snprintf(rep.recommendation, 256, "N=%d. Use DP for exact optimal path. Backtracking will be too slow.", m->n);
    } else if (rep.triangle_inequality) {
        snprintf(rep.recommendation, 256, "N=%d is large but Metric. Use Christofides for a guaranteed 1.5x approximation.", m->n);
    } else {
        snprintf(rep.recommendation, 256, "N=%d is large and non-metric. Use Greedy Nearest Neighbor. Christofides bounds not guaranteed.", m->n);
    }

    return rep;
}