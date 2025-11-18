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

echo "🗺️ BroksAI Sprint 6 - Geolocation Search Testing"
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

test_endpoint "Geo Search 5km Radius (Moscow Center)" \
  "$BASE/api/search?lat=55.7558&lng=37.6173&radius=5" \
  "200" ".filteredTotal"

test_endpoint "Geo Search 1km Radius (tight)" \
  "$BASE/api/search?lat=55.7558&lng=37.6173&radius=1" \
  "200" ".filteredTotal"

test_endpoint "Geo Search 20km Radius (wide)" \
  "$BASE/api/search?lat=55.7558&lng=37.6173&radius=20" \
  "200" ".filteredTotal"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test: Distance Field Present"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
distance_field=$(curl -sS "$BASE/api/search?lat=55.7558&lng=37.6173&radius=5" | jq '.results[0].distanceKm')
if [ -n "$distance_field" ] && [ "$distance_field" != "null" ]; then
  echo "Distance: ${distance_field}km"
  echo -e "${GREEN}✅ PASS${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAIL (distance field missing)${NC}"
  ((FAILED++))
fi
echo ""

test_endpoint "Geo + Price Filter Combined" \
  "$BASE/api/search?lat=55.7558&lng=37.6173&radius=10&priceMin=8000000&priceMax=20000000" \
  "200" ".filteredTotal"

test_endpoint "Geo + Rooms Filter Combined" \
  "$BASE/api/search?lat=55.7558&lng=37.6173&radius=10&rooms=2" \
  "200" ".filteredTotal"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test: Sort by Distance"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
distances=$(curl -sS "$BASE/api/search?lat=55.7558&lng=37.6173&radius=20&sortBy=distance&sortOrder=asc" | jq '.results[].distanceKm')
first=$(echo "$distances" | head -n 1)
last=$(echo "$distances" | tail -n 1)
echo "First: ${first}km, Last: ${last}km"
if [ -n "$first" ] && [ -n "$last" ] && (( $(echo "$first <= $last" | bc -l) )); then
  echo -e "${GREEN}✅ PASS (sorted ascending)${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAIL (not sorted)${NC}"
  ((FAILED++))
fi
echo ""

test_endpoint "Invalid Latitude (>90)" \
  "$BASE/api/search?lat=100&lng=37.6173&radius=5" \
  "400" ".error"

test_endpoint "Invalid Longitude (<-180)" \
  "$BASE/api/search?lat=55.7558&lng=-200&radius=5" \
  "400" ".error"

test_endpoint "Invalid Radius (<0.1)" \
  "$BASE/api/search?lat=55.7558&lng=37.6173&radius=0.05" \
  "400" ".error"

test_endpoint "Invalid Radius (>100)" \
  "$BASE/api/search?lat=55.7558&lng=37.6173&radius=500" \
  "400" ".error"

test_endpoint "Missing Longitude" \
  "$BASE/api/search?lat=55.7558&radius=5" \
  "400" ".error"

test_endpoint "Missing Radius" \
  "$BASE/api/search?lat=55.7558&lng=37.6173" \
  "400" ".error"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Geo Performance Benchmark${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

times=()
for i in {1..10}; do
  time_ms=$(curl -sS "$BASE/api/search?lat=55.7558&lng=37.6173&radius=10&priceMin=5000000" | jq '.metadata.responseTimeMs')
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
