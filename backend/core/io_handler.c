#include "io_handler.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

// helper to parse TSPLIB format files
Matrix read_tsplib_file(const char* filepath) {
    Matrix m;
    m.n = 0;
    m.data = NULL;
    m.is_metric = true;
    m.is_symmetric = true;

    FILE* fp = fopen(filepath, "r");
    if (!fp) return m;

    char line[256];
    int dim = 0;
    bool coords_found = false;

    while (fgets(line, sizeof(line), fp)) {
        if (strncmp(line, "DIMENSION", 9) == 0) {
            char* c = strchr(line, ':');
            if (c) dim = atoi(c + 1);
        }

        else if (strncmp(line, "NODE_COORD_SECTION", 18) == 0) {
            coords_found = true;
            break;
        }
    }


    if (dim > 0 && coords_found) {
        m.n = dim;
        m.data = malloc(dim * dim * sizeof(double));

        double* x = malloc(dim * sizeof(double));
        double* y = malloc(dim * sizeof(double));

        for (int i = 0; i < dim; i++) {
            int id;
            if (fscanf(fp, "%d %lf %lf", &id, &x[i], &y[i]) != 3) break;
        }

        // build adjacency matrix using Euclidean distance
        for (int i = 0; i < dim; i++) {
            for (int j = 0; j < dim; j++) {
                if (i == j) {
                    m.data[i * dim + j] = 0.0;
                } else {
                    double dx = x[i] - x[j];
                    double dy = y[i] - y[j];
                    // standard TSPLIB rounding for EUC_2D
                    m.data[i * dim + j] = round(sqrt(dx * dx + dy * dy));
                }
            }
        }

        free(x);
        free(y);
    }

    fclose(fp);
    return m;
}


// dump experiment results to CSV for analysis
bool export_range_results_csv(const char* path, const RangeResult* res, int count) {
    FILE* f = fopen(path, "w");
    if (!f) return false;

    fprintf(f, "N,ExactCost,ExactTimeMs,GreedyCost,GreedyTimeMs,ChrisCost,ChrisTimeMs,GreedyRatio,ChrisRatio\n");

    for (int i = 0; i < count; i++) {
        fprintf(f, "%d,%.2f,%.4f,%.2f,%.4f,%.2f,%.4f,%.4f,%.4f\n",
                res[i].n,
                res[i].exact_cost,
                res[i].exact_time_ms,
                res[i].greedy_cost,
                res[i].greedy_time_ms,
                res[i].christofides_cost,
                res[i].christofides_time_ms,
                res[i].greedy_ratio,
                res[i].christofides_ratio);
    }

    fclose(f);
    return true;
}