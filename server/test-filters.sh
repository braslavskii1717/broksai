#!/bin/bash

set -e

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required to run this script. Please install jq."
  exit 1
fi

if ! command -v bc >/dev/null 2>&1; then
  echo "bc is required to run this script. Please install bc."
  exit 1
fi

BASE=${BASE_URL:-"http://localhost:4000"}
PASSED=0
FAILED=0

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
MOSCOW_ENCODED='%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0'

echo "🧪 BroksAI Sprint 5 - Advanced Filters Testing"
echo "=============================================="
echo ""

test_endpoint() {
  local name="$1"
  local url="$2"
  local expected_status="$3"
  local check_field="$4"

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Test: $name"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  response=$(curl -sS -w "\n%{http_code}" "$url")
  status="${response##*$'\n'}"
  body="${response%$'\n'$status}"

  echo "Status: $status"

  if [ "$status" = "$expected_status" ]; then
    if [ -n "$check_field" ]; then
      field_value=$(echo "$body" | jq -r "$check_field" 2>/dev/null || echo "null")
      echo "Value: $field_value"
    fi
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAIL (expected $expected_status)${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    ((FAILED++))
  fi
  echo ""
}

test_endpoint "Health Check" "$BASE/health" "200" ".status"
test_endpoint "Search All Properties" "$BASE/api/search?limit=5" "200" ".total"
test_endpoint "Price Range Filter (5M-20M)" "$BASE/api/search?priceMin=5000000&priceMax=20000000" "200" ".filteredTotal"
test_endpoint "Rooms Filter (2 rooms)" "$BASE/api/search?rooms=2" "200" ".filteredTotal"
test_endpoint "Rooms Range Filter (1-2)" "$BASE/api/search?roomsMin=1&roomsMax=2" "200" ".filteredTotal"
test_endpoint "Area Filter (50-80 sqm)" "$BASE/api/search?areaMin=50&areaMax=80" "200" ".filteredTotal"
test_endpoint "City Filter (Москва)" "$BASE/api/search?city=${MOSCOW_ENCODED}" "200" ".filteredTotal"
test_endpoint "Property Type Filter (apartment)" "$BASE/api/search?propertyType=apartment" "200" ".filteredTotal"
test_endpoint "Property Type Filter (apartment,studio)" "$BASE/api/search?propertyType=apartment,studio" "200" ".filteredTotal"
test_endpoint "Combined Filters + Sorting" "$BASE/api/search?priceMin=8000000&priceMax=25000000&rooms=2&sortBy=price&sortOrder=asc" "200" ".results[].price"
test_endpoint "Pagination Page 1 (limit=2, offset=0)" "$BASE/api/search?limit=2&offset=0" "200" ".results | length"
test_endpoint "Pagination Page 2 (limit=2, offset=2)" "$BASE/api/search?limit=2&offset=2" "200" ".results | length"
test_endpoint "Invalid Price (negative)" "$BASE/api/search?priceMin=-1000" "400" ".error"
test_endpoint "Invalid Limit (>100)" "$BASE/api/search?limit=200" "400" ".error"
test_endpoint "Invalid Rooms (>10)" "$BASE/api/search?rooms=20" "400" ".error"
test_endpoint "Invalid Property Type" "$BASE/api/search?propertyType=invalid" "400" ".error"
test_endpoint "Price Min > Max" "$BASE/api/search?priceMin=20000000&priceMax=5000000" "400" ".error"
test_endpoint "Get Available Filters" "$BASE/api/search/filters" "200" ".availableOptions.cities | length"
test_endpoint "Sort by Area (asc)" "$BASE/api/search?sortBy=area&sortOrder=asc&limit=2" "200" ".results[].area"
test_endpoint "Sort by Price (desc)" "$BASE/api/search?sortBy=price&sortOrder=desc&limit=2" "200" ".results[].price"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Performance Benchmark${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

times=()
for i in {1..10}; do
  time_ms=$(curl -sS "$BASE/api/search?priceMin=5000000&priceMax=20000000&rooms=2&sortBy=price" | jq '.metadata.responseTimeMs')
  time_ms=${time_ms:-0}
  times+=("$time_ms")
  echo "Request $i: ${time_ms}ms"
done

avg_time=$(printf '%s\n' "${times[@]}" | awk '{sum+=$1} END {if (NR>0) print sum/NR; else print 0}')

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Average: ${avg_time}ms"

if (( $(echo "$avg_time < 50" | bc -l) )); then
  echo -e "${GREEN}✅ EXCELLENT (< 50ms)${NC}"
  ((PASSED++))
elif (( $(echo "$avg_time < 100" | bc -l) )); then
  echo -e "${YELLOW}⚠️ ACCEPTABLE (< 100ms)${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ SLOW (> 100ms)${NC}"
  ((FAILED++))
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}❌ Failed: $FAILED${NC}"
else
  echo -e "${GREEN}❌ Failed: $FAILED${NC}"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed${NC}"
  exit 1
fi
