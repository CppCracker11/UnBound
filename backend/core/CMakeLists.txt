cmake_minimum_required(VERSION 3.10)
project(UnBoundEngine C)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

# 1. Find OpenMP
find_package(OpenMP REQUIRED)

set(CORE_SOURCES
    utils.c
    tsp_exact.c
    tsp_approx.c
    generator.c
    experiment.c
    analytics.c
    io_handler.c
    diagnostic.c
)

# 2. Setup the Shared Library (DLL)
add_library(unbound_engine SHARED ${CORE_SOURCES} bridge.c)

if(OpenMP_C_FOUND)
    target_link_libraries(unbound_engine PRIVATE OpenMP::OpenMP_C)
    # Explicitly add the compile and link flags for MinGW
    target_compile_options(unbound_engine PRIVATE ${OpenMP_C_FLAGS})
    set_target_properties(unbound_engine PROPERTIES LINK_FLAGS ${OpenMP_C_FLAGS})
endif()

# 3. Setup the CLI Executable (Test Bench)
add_executable(unbound_cli ${CORE_SOURCES} main.c)

if(OpenMP_C_FOUND)
    target_link_libraries(unbound_cli PRIVATE OpenMP::OpenMP_C)
    target_compile_options(unbound_cli PRIVATE ${OpenMP_C_FLAGS})
    set_target_properties(unbound_cli PROPERTIES LINK_FLAGS ${OpenMP_C_FLAGS})
endif()

if(WIN32 AND MINGW)
    target_link_options(unbound_engine PRIVATE -static -static-libgcc)
    target_link_options(unbound_cli PRIVATE -static -static-libgcc)
endif()