#include "common.h"
#include "generator.h"
#include "diagnostic.h"
#include "analytics.h"
#include "experiment.h"
#include "utils.h"
#include "io_handler.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "tsp_approx.h"

void print_path_sequence(const Solution* sol) {
    if (!sol->success) {
        printf("No path found.");
        return;
    }
    for (int i = 0; i < sol->n; i++) {
        printf("%d -> ", sol->path[i]);
    }
    printf("%d", sol->path[0]);
}

int main() {
    int choice = 0;

    printf("========================================\n");
    printf("       UNBOUND C-ENGINE CLI v1.0        \n");
    printf("========================================\n");

    while (1) {
        printf("\n--- MAIN MENU ---\n");
        printf("[1] Sandbox Solver (Direct Solve)\n");
        printf("[2] Performance Lab (Benchmarking N=3 to 20)\n");
        printf("[3] TSPLIB File Processor\n");
        printf("[4] Exit\n");
        printf("Select mode: ");

        if (scanf("%d", &choice) != 1) break;
        if (choice == 4) break;

        switch (choice) {
            case 1: {
                int n, sub;
                printf("\nEnter node count (N): ");
                scanf("%d", &n);

                printf("[1] Random Metric Matrix\n[2] Manual Matrix Entry\nChoose input type: ");
                scanf("%d", &sub);

                Matrix m;
                if (sub == 2) {
                    m.n = n;
                    m.is_metric = true;
                    m.is_symmetric = true;
                    m.data = malloc(n * n * sizeof(double));

                    printf("Enter distances:\n");
                    for (int i = 0; i < n; i++) {
                        for (int j = 0; j < n; j++) {
                            if (i == j) {
                                m.data[i * n + j] = 0.0;
                            } else {
                                printf("Dist [%d] -> [%d]: ", i, j);
                                scanf("%lf", &m.data[i * n + j]);
                            }
                        }
                    }
                } else {
                    m = generate_matrix(n, true, true);
                }

                BenchmarkReport br = run_full_benchmark(&m);

                printf("\n--- SANDBOX RESULTS (N=%d) ---\n", n);
                if (br.exact_dp.success) {
                    printf("[EXACT-DP] Cost: %.2f | Time: %.4f ms\nPath: ", br.exact_dp.cost, br.exact_dp.time_ms);
                    print_path_sequence(&br.exact_dp);
                    printf("\n");
                }
                if (br.approx_chris.success) {
                    printf("[APPROX-CHR] Cost: %.2f | Time: %.4f ms\nPath: ", br.approx_chris.cost, br.approx_chris.time_ms);
                    print_path_sequence(&br.approx_chris);
                    printf("\n");
                }

                free_benchmark_report(&br);
                free_matrix(&m);
                break;
            }

            case 2: {
                int start = 3, end = 20, step = 1, count = 0;
                printf("\nInitializing Lab Benchmark (N=%d to %d)...\n", start, end);

                RangeResult* results = run_range_analysis(start, end, step, true, &count);

                printf("\n--- COST RATIO (APPROXIMATION ACCURACY) ---\n");
                printf("%-5s | %-15s | %-15s\n", "N", "Chris_Ratio", "Greedy_Ratio");
                printf("----------------------------------------\n");
                for (int i = 0; i < count; i++) {
                    printf("%-5d | %-15.4f | %-15.4f\n",
                           results[i].n, results[i].christofides_ratio, results[i].greedy_ratio);
                }

                printf("\n--- EXECUTION TIME (MILLISECONDS) ---\n");
                printf("%-5s | %-12s | %-12s | %-12s\n", "N", "Exact_DP", "Chris", "Greedy");
                printf("--------------------------------------------------\n");
                for (int i = 0; i < count; i++) {
                    printf("%-5d | %-12.4f | %-12.4f | %-12.4f\n",
                           results[i].n, results[i].exact_time_ms, results[i].christofides_time_ms, results[i].greedy_time_ms);
                }

                free(results);
                break;
            }

            case 3: {
                char path[512];
                printf("\nEnter absolute path to TSPLIB .txt file:\n> ");
                scanf("%s", path);

                Matrix m = read_tsplib_file(path);
                if (m.n == 0 || m.data == NULL) {
                    printf("Error: Could not read or parse file.\n");
                } else {
                    DiagnosticReport dr = run_diagnostics(&m);
                    printf("\n--- DIAGNOSTICS ---\n");
                    printf("Nodes: %d | Symmetric: %s | Metric: %s\n",
                           m.n,
                           dr.is_symmetric ? "Yes" : "No",
                           dr.triangle_inequality ? "Yes" : "No");

                    printf("\nSolving with Christofides Algorithm...\n");
                    Solution sol = tsp_christofides(&m);

                    printf("\n--- FILE RESULTS ---\n");
                    printf("Cost: %.2f | Time: %.4f ms\nPath: ", sol.cost, sol.time_ms);
                    print_path_sequence(&sol);
                    printf("\n");

                    free_solution(&sol);
                    free_matrix(&m);
                }
                break;
            }

            default:
                printf("Invalid selection. Please enter a number between 1 and 4.\n");
                // Clear input buffer to prevent infinite loops on bad input
                int c;
                while ((c = getchar()) != '\n' && c != EOF) { }
                break;
        }
    }

    printf("\nExiting UnBound Engine. Goodbye.\n");
    return 0;
}