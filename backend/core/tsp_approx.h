#ifndef UNBOUND_TSP_APPROX_H
#define UNBOUND_TSP_APPROX_H

#include "common.h"

Solution tsp_greedy(const Matrix* m);
Solution tsp_christofides(const Matrix* m);

#endif