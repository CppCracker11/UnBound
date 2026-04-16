#include "experiment.h"
#include "generator.h"
#include "tsp_exact.h"
#include "tsp_approx.h"
#include "utils.h"
#include <stdlib.h>

RangeResult* run_range_analysis(int n_start, int n_end, int step, bool force_metric, int* result_count) {
    int count = 0;
    for (int i = n_start; i <= n_end; i += step) {
        count++;
    }
    *result_count = count;

    RangeResult* results = (RangeResult*)malloc(count * sizeof(RangeResult));
    int idx = 0;

    for (int n = n_start; n <= n_end; n += step) {
        Matrix m = generate_matrix(n, force_metric, force_metric);
        
        Solution sol_exact;
        if (n <= MAX_NODES_DP) {
            sol_exact = tsp_dp(&m);
        } else {
            sol_exact = create_solution(n);
        }

        Solution sol_greedy = tsp_greedy(&m);
        Solution sol_chris = tsp_christofides(&m);

        results[idx].n = n;
        results[idx].exact_cost = sol_exact.success ? sol_exact.cost : -1.0;
        results[idx].exact_time_ms = sol_exact.success ? sol_exact.time_ms : -1.0;
        
        results[idx].greedy_cost = sol_greedy.success ? sol_greedy.cost : -1.0;
        results[idx].greedy_time_ms = sol_greedy.success ? sol_greedy.time_ms : -1.0;
        
        results[idx].christofides_cost = sol_chris.success ? sol_chris.cost : -1.0;
        results[idx].christofides_time_ms = sol_chris.success ? sol_chris.time_ms : -1.0;

        if (sol_exact.success && sol_exact.cost > 0) {
            results[idx].greedy_ratio = results[idx].greedy_cost / results[idx].exact_cost;
            results[idx].christofides_ratio = results[idx].christofides_cost / results[idx].exact_cost;
        } else {
            results[idx].greedy_ratio = -1.0;
            results[idx].christofides_ratio = -1.0;
        }

        free_solution(&sol_exact);
        free_solution(&sol_greedy);
        free_solution(&sol_chris);
        free_matrix(&m);
        
        idx++;
    }

    return results;
}