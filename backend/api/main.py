import ctypes
import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from fastapi.staticfiles import StaticFiles

def get_resource_path(relative_path):
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)

ext = ".dll" if os.name == "nt" else ".so"
lib_name = f"libtspexact{ext}"
lib_path = get_resource_path(lib_name)

try:
    tsp_lib = ctypes.CDLL(lib_path)
    print(f"Successfully loaded C-Engine: {lib_path}")
except OSError as e:
    print(f"CRITICAL ERROR: Could not find {lib_name} at {lib_path}")
    try:
        fallback_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "engines", lib_name))
        tsp_lib = ctypes.CDLL(fallback_path)
        print(f"Loaded via fallback path: {fallback_path}")
    except:
        print("All paths failed. Please ensure the DLL is in the engines folder or root.")
        raise e

tsp_lib.tsp_dp.argtypes = [ctypes.POINTER(ctypes.c_double), ctypes.c_int, ctypes.POINTER(ctypes.c_int)]
tsp_lib.tsp_dp.restype = ctypes.c_double

tsp_lib.tsp_backtracking.argtypes = [ctypes.POINTER(ctypes.c_double), ctypes.c_int, ctypes.POINTER(ctypes.c_int)]
tsp_lib.tsp_backtracking.restype = ctypes.c_double

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class City(BaseModel):
    x: float
    y: float

class TSPRequest(BaseModel):
    cities: List[City]
    algorithm: str 

@app.post("/solve")
async def solve_tsp(request: TSPRequest):
    nodes = request.cities
    n = len(nodes)
    
    if n < 2:
        raise HTTPException(status_code=400, detail="At least 2 cities required.")

    matrix = []
    for i in range(n):
        for j in range(n):
            d = ((nodes[i].x - nodes[j].x)**2 + (nodes[i].y - nodes[j].y)**2)**0.5
            matrix.append(d)

    c_matrix = (ctypes.c_double * len(matrix))(*matrix)
    c_path = (ctypes.c_int * n)()

    if "dp" in request.algorithm.lower():
        cost = tsp_lib.tsp_dp(c_matrix, n, c_path)
    else:
        cost = tsp_lib.tsp_backtracking(c_matrix, n, c_path)

    optimized_path = [c_path[i] for i in range(n)]

    return {
        "cost": round(cost, 2),
        "path": optimized_path,
        "n": n
    }

if os.path.exists(get_resource_path("static")):
    app.mount("/", StaticFiles(directory=get_resource_path("static"), html=True), name="static")