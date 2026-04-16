#include "generator.h"
#include <stdlib.h>
#include <math.h>
#include <time.h>

void free_matrix(Matrix* m) {
    if (m && m->data) {
        free(m->data);
        m->data = NULL;
    }
}

Matrix generate_matrix(int n, bool force_metric, bool force_symmetric) {
    Matrix m;
    m.n = n;
    m.is_metric = force_metric;
    m.is_symmetric = force_metric ? true : force_symmetric;
    m.data = (double*)malloc(n * n * sizeof(double));

    srand((unsigned int)time(NULL));

    if (force_metric) {
        double* x = (double*)malloc(n * sizeof(double));
        double* y = (double*)malloc(n * sizeof(double));
        for (int i = 0; i < n; i++) {
            x[i] = (rand() % 1000) + ((double)rand() / RAND_MAX);
            y[i] = (rand() % 1000) + ((double)rand() / RAND_MAX);
        }
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (i == j) {
                    m.data[i * n + j] = 0.0;
                } else {
                    double dx = x[i] - x[j];
                    double dy = y[i] - y[j];
                    m.data[i * n + j] = sqrt(dx * dx + dy * dy);
                }
            }
        }
        free(x);
        free(y);
    } else {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (i == j) {
                    m.data[i * n + j] = 0.0;
                } else {
                    m.data[i * n + j] = (rand() % 100) + 1.0;
                }
            }
        }
        if (force_symmetric) {
            for (int i = 0; i < n; i++) {
                for (int j = i + 1; j < n; j++) {
                    m.data[j * n + i] = m.data[i * n + j];
                }
            }
        }
    }
    return m;
}