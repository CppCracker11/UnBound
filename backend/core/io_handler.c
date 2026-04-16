#include "io_handler.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

Matrix read_tsplib_file(const char* filepath) {
    Matrix m;
    m.n = 0;
    m.data = NULL;
    m.is_metric = true;
    m.is_symmetric = true;

    FILE* file = fopen(filepath, "r");
    if (!file) return m;

    char line[256];
    int dimension = 0;
    bool in_coord_section = false;

    while (fgets(line, sizeof(line), file)) {
        if (strncmp(line, "DIMENSION", 9) == 0) {
            char* colon = strchr(line, ':');
            if (colon) dimension = atoi(colon + 1);
        } else if (strncmp(line, "NODE_COORD_SECTION", 18) == 0) {
            in_coord_section = true;
            break;
        }
    }

    if (dimension > 0 && in_coord_section) {
        m.n = dimension;
        m.data = (double*)malloc(dimension * dimension * sizeof(double));
        double* x = (double*)malloc(dimension * sizeof(double));
        double* y = (double*)malloc(dimension * sizeof(double));

        for (int i = 0; i < dimension; i++) {
            int id;
            if (fscanf(file, "%d %lf %lf", &id, &x[i], &y[i]) != 3) break;
        }

        for (int i = 0; i < dimension; i++) {
            for (int j = 0; j < dimension; j++) {
                if (i == j) {
                    m.data[i * dimension + j] = 0.0;
                } else {
                    double dx = x[i] - x[j];
                    double dy = y[i] - y[j];
                    m.data[i * dimension + j] = round(sqrt(dx * dx + dy * dy));
                }
            }
        }
        free(x);
        free(y);
    }

    fclose(file);
    return m;
}

bool export_range_results_csv(const char* filepath, const RangeResult* results, int count) {
    FILE* file = fopen(filepath, "w");
    if (!file) return false;

    fprintf(file, "N,ExactCost,ExactTimeMs,GreedyCost,GreedyTimeMs,ChrisCost,ChrisTimeMs,GreedyRatio,ChrisRatio\n");

    for (int i = 0; i < count; i++) {
        fprintf(file, "%d,%.2f,%.4f,%.2f,%.4f,%.2f,%.4f,%.4f,%.4f\n",
                results[i].n,
                results[i].exact_cost,
                results[i].exact_time_ms,
                results[i].greedy_cost,
                results[i].greedy_time_ms,
                results[i].christofides_cost,
                results[i].christofides_time_ms,
                results[i].greedy_ratio,
                results[i].christofides_ratio);
    }

    fclose(file);
    return true;
}