#ifndef UNBOUND_EXPERIMENT_H
#define UNBOUND_EXPERIMENT_H

#include "common.h"

typedef struct {
    int n;
    double exact_cost;
    double exact_time_ms;
    double greedy_cost;
    double greedy_time_ms;
    double christofides_cost;
    double christofides_time_ms;
    double greedy_ratio;
    double christofides_ratio;
} RangeResult;

RangeResult* run_range_analysis(int n_start, int n_end, int step, bool force_metric, int* result_count);

#endif