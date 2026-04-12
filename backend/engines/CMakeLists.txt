cmake_minimum_required(VERSION 3.20)
project(tspexact C)

set(CMAKE_C_STANDARD 11)


add_library(tspexact SHARED tsp_exact.c)


set_target_properties(tspexact PROPERTIES LIBRARY_OUTPUT_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR})
set_target_properties(tspexact PROPERTIES RUNTIME_OUTPUT_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR})