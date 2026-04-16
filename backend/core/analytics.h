#ifndef UNBOUND_ANALYTICS_H
#define UNBOUND_ANALYTICS_H

#include "common.h"

typedef struct {
    Solution exact_dp;
    Solution exact_bt;
    Solution approx_greedy;
    Solution approx_chris;
    double greedy_ratio;
    double chris_ratio;
} BenchmarkReport;

BenchmarkReport run_full_benchmark(const Matrix* m);
void free_benchmark_report(BenchmarkReport* report);

#endif