#ifndef UNBOUND_GENERATOR_H
#define UNBOUND_GENERATOR_H

#include "common.h"

Matrix generate_matrix(int n, bool force_metric, bool force_symmetric);
void free_matrix(Matrix* m);

#endif