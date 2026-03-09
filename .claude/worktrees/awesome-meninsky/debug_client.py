import sys
import os
import asyncio
import httpx
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "src")))
from fhir_mcp.services.service_factory import get_intelligence_service

async def verify_parity():
    print("\n--- [V3.1] PARITY TESTING SUITE: ONE LOGIC, TWO PROTOCOLS ---\n")
    
    # 1. Initialize logic layer directly (Internal source of truth)
    intelligence = get_intelligence_service()
    query = "Diabetes"
    
    print(f"Step 1: Fetching Suggestions directly via Service Layer for '{query}'...")
    internal_results = await intelligence.get_semantic_suggestions(query)
    internal_json = [r.model_dump() for r in internal_results]
    print(f"Internal Data: {json.dumps(internal_json[:1], indent=2)}...\n")

    # 2. Verify REST Protocol (Requires server to be running)
    print("Step 2: verifying REST Protocol (ensure server is running at :8000)...")
    api_key = os.getenv("INTERNAL_API_KEY", "your_internal_key")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "http://localhost:8000/api/v3/semantic-search",
                params={"q": query},
                headers={"X-API-KEY": api_key},
                timeout=5.0
            )
            
            if response.status_code == 200:
                rest_json = response.json()
                print(f"REST Data: {json.dumps(rest_json[:1], indent=2)}...\n")
                
                # Compare structures rigorously
                # Note: internal_json is a list of dicts, rest_json is a list of dicts
                if json.dumps(internal_json) == json.dumps(rest_json):
                    print("✅ [PASS] Parity Check: Internal logic and REST response are 100% identical.")
                else:
                    print("❌ [FAIL] Parity Check: Logic mismatch between internal layer and REST response.")
            elif response.status_code == 403:
                print("❌ [FAIL] Security Gate: Access Forbidden (Check INTERNAL_API_KEY)")
            else:
                print(f"⚠️ [SKIP] REST verification failed with status {response.status_code}. Is the server running?")
        except Exception as e:
            print(f"⚠️ [SKIP] Could not connect to REST API: {str(e)}")

    # 3. Cache Hit Verification
    print("\nStep 3: Verification of Cache Performance...")
    import time
    start = time.time()
    await intelligence.get_semantic_suggestions(query)
    duration = (time.time() - start) * 1000
    print(f"Result returned in {duration:.2f}ms")
    if duration < 10:
        print("✅ [PASS] Cache Hit: Response served from memory in < 10ms.")
    else:
        print("❌ [FAIL] Cache Miss: External I/O occurred on cached data.")

if __name__ == "__main__":
    if not os.getenv("INTERNAL_API_KEY"):
        os.environ["INTERNAL_API_KEY"] = "debug_key"
    asyncio.run(verify_parity())
