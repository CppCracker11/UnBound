from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import MatrixInput, RangeRequest
from .bridge_wrapper import create_c_matrix, wrap_solution, wrap_range_results, lib
import ctypes

app = FastAPI(title="UnBound v3.0 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/diagnose")
def diagnose_matrix(payload: MatrixInput):
    c_matrix = create_c_matrix(payload.matrix, payload.n, payload.is_metric, payload.is_symmetric)
    report = lib.api_run_diagnostics(ctypes.byref(c_matrix))
    return {
        "is_symmetric": report.is_symmetric,
        "triangle_inequality": report.triangle_inequality,
        "recommendation": report.recommendation.decode('utf-8'),
        "est_time_dp_ms": report.est_time_dp_ms,
        "est_time_bt_ms": report.est_time_bt_ms
    }

@app.post("/solve/{algo}")
def solve_tsp(algo: str, payload: MatrixInput):
    c_matrix = create_c_matrix(payload.matrix, payload.n, payload.is_metric, payload.is_symmetric)
    
    if algo == "dp":
        sol = lib.api_solve_dp(ctypes.byref(c_matrix))
    elif algo == "bt":
        sol = lib.api_solve_bt(ctypes.byref(c_matrix))
    elif algo == "greedy":
        sol = lib.api_solve_greedy(ctypes.byref(c_matrix))
    elif algo == "christofides" or algo == "chris":
        sol = lib.api_solve_christofides(ctypes.byref(c_matrix))
    else:
        raise HTTPException(status_code=400, detail="Invalid algorithm parameter")
        
    return wrap_solution(sol, algo)

@app.post("/experiment/range")
def run_experiment(req: RangeRequest):
    count = ctypes.c_int()
    ptr = lib.api_run_range(req.start_n, req.end_n, req.step, req.force_metric, ctypes.byref(count))
    if not ptr:
        raise HTTPException(status_code=500, detail="Experiment failed in C-Engine")
    
    return wrap_range_results(ptr, count.value)

@app.get("/generate/{n}")
def generate_random(n: int, metric: bool = True):
    c_mat = lib.api_generate_matrix(n, metric, True)
    data_list = [c_mat.data[i] for i in range(n * n)]
    return {"matrix": data_list, "n": n}