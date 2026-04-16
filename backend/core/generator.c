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


Matrix generate_matrix(int n, bool metric, bool symmetric) {
    Matrix m;
    m.n = n;
    m.is_metric = metric;

    // metric implies symmetric in this implementation
    m.is_symmetric = metric ? true : symmetric;
    m.data = malloc(n * n * sizeof(double));

    srand((unsigned int)time(NULL));


    if (metric) {
        // generate random coordinates to ensure triangle inequality holds
        double* x = malloc(n * sizeof(double));
        double* y = malloc(n * sizeof(double));

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
    }

    else {
        // non-metric random generation
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (i == j) {
                    m.data[i * n + j] = 0.0;
                } else {
                    m.data[i * n + j] = (rand() % 100) + 1.0;
                }
            }
        }

        if (symmetric) {
            for (int i = 0; i < n; i++) {
                for (int j = i + 1; j < n; j++) {
                    m.data[j * n + i] = m.data[i * n + j];
                }
            }
        }
    }

    return m;
}