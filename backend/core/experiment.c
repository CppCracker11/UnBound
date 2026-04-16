#include "experiment.h"
#include "generator.h"
#include "tsp_exact.h"
#include "tsp_approx.h"
#include "utils.h"
#include <stdlib.h>


// Main runner for the Performance Lab analysis
RangeResult* run_range_analysis(int start, int end, int step, bool metric, int* out_count) {
    int count = 0;
    for (int i = start; i <= end; i += step) count++;

    *out_count = count;
    RangeResult* res_list = malloc(count * sizeof(RangeResult));
    int idx = 0;

    for (int n = start; n <= end; n += step) {
        // generate test data for this N
        Matrix m = generate_matrix(n, metric, metric);

        Solution s_exact;
        // Watchdog: only run DP if within safety limits to avoid Nitro freezing
        if (n <= MAX_NODES_DP) {
            s_exact = tsp_dp(&m);
        } else {
            s_exact = create_solution(n); // return empty if too heavy
        }

        Solution s_greedy = tsp_greedy(&m);
        Solution s_chris  = tsp_christofides(&m);


        // Pack results
        res_list[idx].n = n;

        res_list[idx].exact_cost = s_exact.success ? s_exact.cost : -1.0;
        res_list[idx].exact_time_ms = s_exact.success ? s_exact.time_ms : -1.0;

        res_list[idx].greedy_cost = s_greedy.success ? s_greedy.cost : -1.0;
        res_list[idx].greedy_time_ms = s_greedy.success ? s_greedy.time_ms : -1.0;

        res_list[idx].christofides_cost = s_chris.success ? s_chris.cost : -1.0;
        res_list[idx].christofides_time_ms = s_chris.success ? s_chris.time_ms : -1.0;


        // Calculate approximation ratios relative to optimal (1.0 is perfect)
        if (s_exact.success && s_exact.cost > 0) {
            res_list[idx].greedy_ratio = res_list[idx].greedy_cost / res_list[idx].exact_cost;
            res_list[idx].christofides_ratio = res_list[idx].christofides_cost / res_list[idx].exact_cost;
        } else {
            res_list[idx].greedy_ratio = -1.0;
            res_list[idx].christofides_ratio = -1.0;
        }

        // Cleanup this iteration's memory
        free_solution(&s_exact);
        free_solution(&s_greedy);
        free_solution(&s_chris);
        free_matrix(&m);

        idx++;
    }

    return res_list;
}