#ifndef UNBOUND_TSP_EXACT_H
#define UNBOUND_TSP_EXACT_H

#include "common.h"

Solution tsp_dp(const Matrix* m);
Solution tsp_backtracking_parallel(const Matrix* m);

#endif