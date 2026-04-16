#ifndef UNBOUND_IO_HANDLER_H
#define UNBOUND_IO_HANDLER_H

#include "common.h"
#include "experiment.h"

Matrix read_tsplib_file(const char* filepath);
bool export_range_results_csv(const char* filepath, const RangeResult* results, int count);

#endif