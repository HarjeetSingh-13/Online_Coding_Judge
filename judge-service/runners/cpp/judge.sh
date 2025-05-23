#!/bin/bash
# set -euo pipefail

WORKDIR=/tmp/run
mkdir -p "$WORKDIR"
cd "$WORKDIR"

cp /home/judgeuser/code/solution.cpp ./solution.cpp
cp /home/judgeuser/input.txt ./input.txt
cp /home/judgeuser/expected_output.txt ./expected_output.txt

debug_info=""
if ! g++ -O2 -std=c++17 -march=x86-64 -mtune=generic solution.cpp -o solution.out 2> compile_error.txt; then
    debug_info=$(cat compile_error.txt)
    echo "{\"verdict\": \"Compilation Error\", \"runtime\": 0.0, \"debug_info\": $(jq -Rs . <<<"$debug_info")}"
    exit 0
fi

chmod +x solution.out

ulimit -v ${MEMORY_LIMIT:-131072}
TIME_LIMIT=${TIME_LIMIT:-5}

start_time=$(date +%s.%N)
timeout ${TIME_LIMIT}s ./solution.out < input.txt > actual_output.txt 2> runtime_error.txt
status=$?
end_time=$(date +%s.%N)

runtime=$(echo "$end_time - $start_time" | bc)
runtime=$(printf "%.6f" "$runtime")

if [ $status -eq 124 ]; then
    echo "{\"verdict\": \"Time Limit Exceeded\", \"runtime\": $runtime, \"debug_info\": \"\"}"
    exit 0 
elif [ $status -eq 137 ] || grep -iq "killed" runtime_error.txt; then
    echo "{\"verdict\": \"Memory Limit Exceeded\", \"runtime\": $runtime, \"debug_info\": $(jq -Rs . <<<"$(cat runtime_error.txt)")}"; 
elif [ $status -ne 0 ]; then
    debug_info=$(cat runtime_error.txt)
    echo "{\"verdict\": \"Runtime Error\", \"runtime\": $runtime, \"debug_info\": $(jq -Rs . <<<"$debug_info")}"
    exit 0
elif ! diff -q --strip-trailing-cr actual_output.txt expected_output.txt > /dev/null; then
    echo "{\"verdict\": \"Wrong Answer\", \"runtime\": $runtime, \"debug_info\": \"\"}"
    exit 0
else
    echo "{\"verdict\": \"Accepted\", \"runtime\": $runtime, \"debug_info\": \"\"}"
    exit 0
fi
