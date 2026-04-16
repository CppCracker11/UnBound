import ctypes
import os

lib_path = os.path.join(os.path.dirname(__file__), "libunbound_engine.dll")
lib = ctypes.CDLL(lib_path)

class Matrix(ctypes.Structure):
    _fields_ = [
        ("data", ctypes.POINTER(ctypes.c_double)),
        ("n", ctypes.c_int),
        ("is_metric", ctypes.c_bool),
        ("is_symmetric", ctypes.c_bool)
    ]

class Solution(ctypes.Structure):
    _fields_ = [
        ("cost", ctypes.c_double),
        ("path", ctypes.POINTER(ctypes.c_int)),
        ("n", ctypes.c_int),
        ("time_ms", ctypes.c_double),
        ("success", ctypes.c_bool)
    ]

class DiagnosticReport(ctypes.Structure):
    _fields_ = [
        ("is_symmetric", ctypes.c_bool),
        ("triangle_inequality", ctypes.c_bool),
        ("recommendation", ctypes.c_char * 256),
        ("est_time_dp_ms", ctypes.c_double),
        ("est_time_bt_ms", ctypes.c_double)
    ]

class RangeResult(ctypes.Structure):
    _fields_ = [
        ("n", ctypes.c_int),
        ("exact_cost", ctypes.c_double),
        ("exact_time_ms", ctypes.c_double),
        ("greedy_cost", ctypes.c_double),
        ("greedy_time_ms", ctypes.c_double),
        ("christofides_cost", ctypes.c_double),
        ("christofides_time_ms", ctypes.c_double),
        ("greedy_ratio", ctypes.c_double),
        ("christofides_ratio", ctypes.c_double)
    ]

lib.api_solve_dp.argtypes = [ctypes.POINTER(Matrix)]
lib.api_solve_dp.restype = Solution

lib.api_solve_bt.argtypes = [ctypes.POINTER(Matrix)]
lib.api_solve_bt.restype = Solution

lib.api_solve_greedy.argtypes = [ctypes.POINTER(Matrix)]
lib.api_solve_greedy.restype = Solution

lib.api_solve_christofides.argtypes = [ctypes.POINTER(Matrix)]
lib.api_solve_christofides.restype = Solution

lib.api_run_diagnostics.argtypes = [ctypes.POINTER(Matrix)]
lib.api_run_diagnostics.restype = DiagnosticReport

lib.api_run_range.argtypes = [ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.c_bool, ctypes.POINTER(ctypes.c_int)]
lib.api_run_range.restype = ctypes.POINTER(RangeResult)

lib.api_generate_matrix.argtypes = [ctypes.c_int, ctypes.c_bool, ctypes.c_bool]
lib.api_generate_matrix.restype = Matrix

lib.api_free_solution.argtypes = [ctypes.POINTER(Solution)]
lib.api_free_solution.restype = None

lib.api_free_range.argtypes = [ctypes.POINTER(RangeResult)]
lib.api_free_range.restype = None

def create_c_matrix(py_list, n, metric, symmetric):
    data_array = (ctypes.c_double * len(py_list))(*py_list)
    return Matrix(data=data_array, n=n, is_metric=metric, is_symmetric=symmetric)

def wrap_solution(sol, algo_name):
    path = [sol.path[i] for i in range(sol.n)]
    res = {
        "cost": sol.cost,
        "path": path,
        "time_ms": sol.time_ms,
        "success": sol.success,
        "algo_name": algo_name
    }
    lib.api_free_solution(ctypes.byref(sol))
    return res

def wrap_range_results(ptr, count):
    results = []
    for i in range(count):
        res = ptr[i]
        results.append({
            "n": res.n,
            "exact": {"cost": res.exact_cost, "time": res.exact_time_ms},
            "greedy": {"cost": res.greedy_cost, "time": res.greedy_time_ms, "ratio": res.greedy_ratio},
            "chris": {"cost": res.christofides_cost, "time": res.christofides_time_ms, "ratio": res.christofides_ratio}
        })
    lib.api_free_range(ptr)
    return results