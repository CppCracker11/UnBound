from pydantic import BaseModel, Field
from typing import List, Optional

class MatrixInput(BaseModel):
    # The matrix must be sent as a flat 1D array (Length must equal n * n)
    matrix: List[float] = Field(..., description="Flattened 1D array representing the NxN matrix")
    n: int = Field(..., gt=0, description="Dimension of the matrix (N)")
    is_metric: bool = Field(default=True, description="Is the matrix expected to satisfy the triangle inequality?")
    is_symmetric: bool = Field(default=True, description="Is the matrix symmetric?")

class SolutionResponse(BaseModel):
    cost: float = Field(..., description="Total cost of the computed tour")
    path: List[int] = Field(..., description="Ordered list of visited nodes")
    time_ms: float = Field(..., description="Execution time in milliseconds")
    success: bool = Field(..., description="Whether a valid path was found")
    algo_name: str = Field(..., description="The algorithm used (e.g., 'dp', 'greedy')")

class DiagnosticResponse(BaseModel):
    is_symmetric: bool
    triangle_inequality: bool
    recommendation: str
    est_time_dp_ms: float
    est_time_bt_ms: float

class RangeRequest(BaseModel):
    start_n: int = Field(..., ge=3, description="Starting N for the experiment (min 3)")
    end_n: int = Field(..., ge=3, description="Ending N for the experiment")
    step: int = Field(..., ge=1, description="Step size between iterations")
    force_metric: bool = Field(default=True, description="Force metric properties for generated matrices")