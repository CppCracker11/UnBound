cmake_minimum_required(VERSION 4.0)
project(UnBound C)

set(CMAKE_C_STANDARD 11)

include_directories(.)

add_executable(UnBound
        tsp_exact.h
        tsp_exact.c
        main.c)
