#include "tsp_exact.h"
#include "tsp_approx.h"
#include "experiment.h"
#include "analytics.h"
#include "diagnostic.h"
#include "generator.h"
#include "io_handler.h"
#include <stdlib.h>
#include "utils.h"
#ifdef _WIN32
#define EXPORT __declspec(dllexport)
#else
#define EXPORT
#endif

EXPORT Solution api_solve_dp(Matrix* m) { 
    return tsp_dp(m); 
}

EXPORT Solution api_solve_bt(Matrix* m) { 
    return tsp_backtracking_parallel(m); 
}

EXPORT Solution api_solve_greedy(Matrix* m) { 
    return tsp_greedy(m); 
}

EXPORT Solution api_solve_christofides(Matrix* m) { 
    return tsp_christofides(m); 
}

EXPORT DiagnosticReport api_run_diagnostics(Matrix* m) { 
    return run_diagnostics(m); 
}

EXPORT BenchmarkReport api_run_benchmark(Matrix* m) { 
    return run_full_benchmark(m); 
}

EXPORT void api_free_benchmark(BenchmarkReport* rep) { 
    free_benchmark_report(rep); 
}

EXPORT RangeResult* api_run_range(int start, int end, int step, bool metric, int* count) {
    return run_range_analysis(start, end, step, metric, count);
}

EXPORT void api_free_range(RangeResult* res) { 
    if (res) free(res); 
}

EXPORT void api_free_solution(Solution* sol) { 
    free_solution(sol); 
}

EXPORT Matrix api_generate_matrix(int n, bool metric, bool symmetric) {
    return generate_matrix(n, metric, symmetric);
}

EXPORT void api_free_matrix(Matrix* m) {
    free_matrix(m);
}