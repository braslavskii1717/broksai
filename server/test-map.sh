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

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🗺️ BroksAI Sprint 10 - Map Functionality Testing"
echo "================================================="
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

test_endpoint "Map Query - Moscow Area (with clustering)" \
  "$BASE/api/map/properties?south=55.5&west=37.3&north=55.9&east=37.9&zoom=12" \
  "200" ".total"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test: Clustering Applied (zoom < 15)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
clustered=$(curl -sS "$BASE/api/map/properties?south=55.5&west=37.3&north=55.9&east=37.9&zoom=12" | jq '.clustered')
if [ "$clustered" = "true" ]; then
  echo "Clustered: true"
  echo -e "${GREEN}✅ PASS${NC}"
  ((PASSED++))
else
  echo "Clustered: false (expected true)"
  echo -e "${RED}❌ FAIL${NC}"
  ((FAILED++))
fi
echo ""

test_endpoint "Map Query - High Zoom (no clustering)" \
  "$BASE/api/map/properties?south=55.7&west=37.5&north=55.8&east=37.7&zoom=16" \
  "200" ".total"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test: No Clustering (zoom >= 15)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
clustered=$(curl -sS "$BASE/api/map/properties?south=55.7&west=37.5&north=55.8&east=37.7&zoom=16" | jq '.clustered')
if [ "$clustered" = "false" ]; then
  echo "Clustered: false"
  echo -e "${GREEN}✅ PASS${NC}"
  ((PASSED++))
else
  echo "Clustered: true (expected false)"
  echo -e "${RED}❌ FAIL${NC}"
  ((FAILED++))
fi
echo ""

test_endpoint "Map + Price Filter" \
  "$BASE/api/map/properties?south=55.7&west=37.5&north=55.8&east=37.7&priceMin=8000000&priceMax=20000000" \
  "200" ".total"

test_endpoint "Map + Rooms Filter" \
  "$BASE/api/map/properties?south=55.7&west=37.5&north=55.8&east=37.7&rooms=2" \
  "200" ".total"

test_endpoint "Clustering Disabled (cluster=false)" \
  "$BASE/api/map/properties?south=55.5&west=37.3&north=55.9&east=37.9&cluster=false" \
  "200" ".clustered"

test_endpoint "Custom Cluster Radius" \
  "$BASE/api/map/properties?south=55.5&west=37.3&north=55.9&east=37.9&zoom=12&clusterRadius=100" \
  "200" ".total"

test_endpoint "Limit Results (limit=2)" \
  "$BASE/api/map/properties?south=55.5&west=37.3&north=55.9&east=37.9&limit=2" \
  "200" ".items | length"

test_endpoint "Invalid Bounds (missing north)" \
  "$BASE/api/map/properties?south=55.5&west=37.3&east=37.9" \
  "400" ".error"

test_endpoint "Invalid Bounds (south >= north)" \
  "$BASE/api/map/properties?south=55.9&west=37.3&north=55.5&east=37.9" \
  "400" ".error"

test_endpoint "Invalid Zoom (> 22)" \
  "$BASE/api/map/properties?south=55.5&west=37.3&north=55.9&east=37.9&zoom=25" \
  "400" ".error"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Map Performance Benchmark${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

times=()
for i in {1..10}; do
  time_ms=$(curl -sS "$BASE/api/map/properties?south=55.5&west=37.3&north=55.9&east=37.9&zoom=12" | jq '.metadata.responseTimeMs')
  time_ms=${time_ms:-0}
  times+=("$time_ms")
  echo "Request $i: ${time_ms}ms"
done

avg_time=$(printf '%s\n' "${times[@]}" | awk '{sum+=$1} END {if (NR>0) print sum/NR; else print 0}')

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Average: ${avg_time}ms"

if (( $(echo "$avg_time < 50" | bc -l) )); then
  echo -e "${GREEN}✅ EXCELLENT (<50ms)${NC}"
  ((PASSED++))
elif (( $(echo "$avg_time < 100" | bc -l) )); then
  echo -e "${YELLOW}⚠️ ACCEPTABLE (<100ms)${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ SLOW (>100ms)${NC}"
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
