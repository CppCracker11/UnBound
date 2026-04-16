#include "analytics.h"
#include "tsp_exact.h"
#include "tsp_approx.h"
#include "utils.h"
#include <stdlib.h>

BenchmarkReport run_full_benchmark(const Matrix* m) {
    BenchmarkReport report;
    
    if (m->n <= MAX_NODES_DP) {
        report.exact_dp = tsp_dp(m);
    } else {
        report.exact_dp = create_solution(m->n);
    }

    if (m->n <= MAX_NODES_BT) {
        report.exact_bt = tsp_backtracking_parallel(m);
    } else {
        report.exact_bt = create_solution(m->n);
    }

    report.approx_greedy = tsp_greedy(m);
    report.approx_chris = tsp_christofides(m);

    double optimal = -1.0;
    if (report.exact_dp.success) {
        optimal = report.exact_dp.cost;
    } else if (report.exact_bt.success) {
        optimal = report.exact_bt.cost;
    }

    if (optimal > 0) {
        report.greedy_ratio = report.approx_greedy.success ? (report.approx_greedy.cost / optimal) : -1.0;
        report.chris_ratio = report.approx_chris.success ? (report.approx_chris.cost / optimal) : -1.0;
    } else {
        report.greedy_ratio = -1.0;
        report.chris_ratio = -1.0;
    }

    return report;
}

void free_benchmark_report(BenchmarkReport* report) {
    free_solution(&report->exact_dp);
    free_solution(&report->exact_bt);
    free_solution(&report->approx_greedy);
    free_solution(&report->approx_chris);
}