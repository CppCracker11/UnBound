#include "common.h"
#include "generator.h"
#include "diagnostic.h"
#include "analytics.h"
#include "experiment.h"
#include "utils.h"
#include <stdio.h>
#include <stdlib.h>

int main() {
    int n = 12;
    
    Matrix m = generate_matrix(n, true, true);
    
    DiagnosticReport diag = run_diagnostics(&m);
    printf("--- DIAGNOSTIC REPORT ---\n");
    printf("Symmetric: %s\n", diag.is_symmetric ? "Yes" : "No");
    printf("Metric: %s\n", diag.triangle_inequality ? "Yes" : "No");
    printf("DP Est Time: %.4f ms\n", diag.est_time_dp_ms);
    printf("Recommendation: %s\n\n", diag.recommendation);
    
    BenchmarkReport bench = run_full_benchmark(&m);
    printf("--- BENCHMARK RESULTS (N=%d) ---\n", n);
    
    if (bench.exact_dp.success) {
        printf("Exact (DP): Cost = %.2f, Time = %.4f ms\n", bench.exact_dp.cost, bench.exact_dp.time_ms);
    }
    if (bench.exact_bt.success) {
        printf("Exact (BT): Cost = %.2f, Time = %.4f ms\n", bench.exact_bt.cost, bench.exact_bt.time_ms);
    }
    if (bench.approx_greedy.success) {
        printf("Approx (Greedy): Cost = %.2f, Time = %.4f ms, Ratio = %.4f\n", 
               bench.approx_greedy.cost, bench.approx_greedy.time_ms, bench.greedy_ratio);
    }
    if (bench.approx_chris.success) {
        printf("Approx (Chris): Cost = %.2f, Time = %.4f ms, Ratio = %.4f\n", 
               bench.approx_chris.cost, bench.approx_chris.time_ms, bench.chris_ratio);
    }
    
    free_benchmark_report(&bench);
    free_matrix(&m);
    
    return 0;
}