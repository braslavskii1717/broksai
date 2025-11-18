#!/bin/bash

set -e

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required to run this script. Please install jq."
  exit 1
fi

BASE=${BASE_URL:-"http://localhost:4000"}
PASSED=0
FAILED=0

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🗺️ BroksAI Sprint 10 - Yandex Maps Integration Testing"
echo "========================================================"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️ NOTE: These tests require YANDEX_MAPS_API_KEY"
echo "If not configured, geocoding tests will be skipped"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
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

  if [ "$status" = "404" ] && echo "$body" | grep -q "Could not"; then
    echo -e "${YELLOW}⚠️ SKIP (API key not configured or address unavailable)${NC}"
    return
  fi

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

ADDRESS=$(printf '%s' 'Москва, ул. Тверская, 10' | jq -sRr @uri)
test_endpoint "Geocode Moscow Address" \
  "$BASE/api/map/geocode?address=$ADDRESS" \
  "200" ".coordinates"

ADDRESS=$(printf '%s' 'Москва, Арбат, 25' | jq -sRr @uri)
test_endpoint "Geocode Arbat Address" \
  "$BASE/api/map/geocode?address=$ADDRESS" \
  "200" ".formattedAddress"

test_endpoint "Reverse Geocode Moscow Center" \
  "$BASE/api/map/reverse-geocode?lng=37.6173&lat=55.7558" \
  "200" ".formattedAddress"

test_endpoint "Reverse Geocode Arbat" \
  "$BASE/api/map/reverse-geocode?lng=37.5943&lat=55.7520" \
  "200" ".components.city"

test_endpoint "Missing Address Parameter" \
  "$BASE/api/map/geocode" \
  "400" ".error"

test_endpoint "Missing Coordinates" \
  "$BASE/api/map/reverse-geocode?lng=37.6173" \
  "400" ".error"

test_endpoint "Invalid Coordinates (lat > 90)" \
  "$BASE/api/map/reverse-geocode?lng=37.6173&lat=100" \
  "400" ".error"

test_endpoint "Invalid Coordinates (lng > 180)" \
  "$BASE/api/map/reverse-geocode?lng=200&lat=55.7558" \
  "400" ".error"

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
