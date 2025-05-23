#!/bin/bash
# set -euo pipefail

WORKDIR=/tmp/run
mkdir -p "$WORKDIR"
cd "$WORKDIR"

cp /home/judgeuser/code/solution.py ./solution.py
cp /home/judgeuser/input.txt ./input.txt
cp /home/judgeuser/expected_output.txt ./expected_output.txt

ulimit -v ${MEMORY_LIMIT:-131072}
TIME_LIMIT=${TIME_LIMIT:-5}

start_time=$(date +%s.%N)
timeout ${TIME_LIMIT}s python3 solution.py < input.txt > actual_output.txt 2> runtime_error.txt
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
elif ! diff -q <(tr -d '\r' < actual_output.txt) <(tr -d '\r' < expected_output.txt) > /dev/null; then
    echo "{\"verdict\": \"Wrong Answer\", \"runtime\": $runtime, \"debug_info\": \"\"}"
    exit 0
else
    echo "{\"verdict\": \"Accepted\", \"runtime\": $runtime, \"debug_info\": \"\"}"
    exit 0
fi
