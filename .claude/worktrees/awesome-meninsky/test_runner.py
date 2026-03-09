import asyncio
import json
from unittest.mock import AsyncMock, patch, MagicMock
from fhir_mcp.services.fhir_client import FHIRClient
from fhir_mcp.services.auth_manager import AuthManager
from fhir_mcp.config.settings import Settings
from fhir_mcp.tools.fhir_resources import register_fhir_tools
from fastmcp import FastMCP

async def run_scenario(name, coro_func):
    # Success indicator in green, Fail in red
    print(f"Running Scenario: {name}...", end=" ", flush=True)
    try:
        await coro_func()
        print("\033[92mPASS\033[0m")
        return True
    except Exception as e:
        # import traceback
        # traceback.print_exc()
        print(f"\033[91mFAIL\033[0m: {str(e)}")
        return False

async def main():
    def get_test_settings():
        settings = Settings()
        settings.fhir_server_base_url = "https://hapi.fhir.org/baseR4"
        settings.fhir_server_disable_authorization = True
        return settings

    results = []

    async def call_tool_direct(server, name, args):
        tool = await server.get_tool(name)
        result = await tool.run(args)
        # FastMCP ToolResult has a .content list of TextContent objects
        if hasattr(result, "content") and result.content:
            return result.content[0].text
        return str(result)

    # 1. Search Patients Tool
    async def s1():
        settings = get_test_settings()
        client = FHIRClient(settings, AuthManager(settings))
        server = FastMCP("test1")
        register_fhir_tools(server, client)
        mock_bundle = {"resourceType": "Bundle", "total": 1, "entry": [{"resource": {"resourceType": "Patient", "id": "1", "name": [{"family": "Doe"}]}}]}
        with patch("httpx.AsyncClient.request", new_callable=AsyncMock) as m:
            resp = MagicMock(); resp.status_code = 200; resp.json.return_value = mock_bundle
            m.return_value = resp
            res = await call_tool_direct(server, "search_patients", {"family": "Doe"})
            assert "Doe" in res and "Found 1" in res

    # 2. Read Patient Tool
    async def s2():
        settings = get_test_settings()
        client = FHIRClient(settings, AuthManager(settings))
        server = FastMCP("test2")
        register_fhir_tools(server, client)
        mock_p = {"resourceType": "Patient", "id": "123", "name": [{"family": "Smith"}]}
        with patch("httpx.AsyncClient.request", new_callable=AsyncMock) as m:
            resp = MagicMock(); resp.status_code = 200; resp.json.return_value = mock_p
            m.return_value = resp
            res = await call_tool_direct(server, "read", {"resource_type": "Patient", "resource_id": "123"})
            assert "Patient/123" in res and "Smith" in res

    # 3. Create Resource
    async def s3():
        settings = get_test_settings()
        client = FHIRClient(settings, AuthManager(settings))
        server = FastMCP("test3")
        register_fhir_tools(server, client)
        payload = {"resourceType": "Observation", "status": "final"}
        with patch("httpx.AsyncClient.request", new_callable=AsyncMock) as m:
            resp = MagicMock(); resp.status_code = 201; resp.json.return_value = {**payload, "id": "new-1"}
            m.return_value = resp
            res = await call_tool_direct(server, "create", {"resource_type": "Observation", "payload": payload})
            assert "Successfully created Observation/new-1" in res

    # 4. Update Resource
    async def s4():
        settings = get_test_settings()
        client = FHIRClient(settings, AuthManager(settings))
        server = FastMCP("test4")
        register_fhir_tools(server, client)
        payload = {"resourceType": "Patient", "id": "123", "active": False}
        with patch("httpx.AsyncClient.request", new_callable=AsyncMock) as m:
            resp = MagicMock(); resp.status_code = 200; resp.json.return_value = payload
            m.return_value = resp
            res = await call_tool_direct(server, "update", {"resource_type": "Patient", "resource_id": "123", "payload": payload})
            assert "Successfully updated" in res

    # 5. Delete Resource
    async def s5():
        settings = get_test_settings()
        client = FHIRClient(settings, AuthManager(settings))
        server = FastMCP("test5")
        register_fhir_tools(server, client)
        with patch("httpx.AsyncClient.request", new_callable=AsyncMock) as m:
            resp = MagicMock(); resp.status_code = 204; resp.json.return_value = {}
            m.return_value = resp
            res = await call_tool_direct(server, "delete", {"resource_type": "Patient", "resource_id": "123"})
            assert "Successfully deleted" in res

    # 6. Capabilities Discovery
    async def s6():
        settings = get_test_settings()
        client = FHIRClient(settings, AuthManager(settings))
        server = FastMCP("test6")
        register_fhir_tools(server, client)
        with patch("httpx.AsyncClient.request", new_callable=AsyncMock) as m:
            resp = MagicMock(); resp.status_code = 200; resp.json.return_value = {"resourceType": "CapabilityStatement", "fhirVersion": "4.0.1", "rest": [{"resource": [{"type": "Patient"}]}]}
            m.return_value = resp
            res = await call_tool_direct(server, "get_capabilities", {})
            assert "v4.0.1" in res

    # 7. Search Conditions
    async def s7():
        settings = get_test_settings()
        client = FHIRClient(settings, AuthManager(settings))
        server = FastMCP("test7")
        register_fhir_tools(server, client)
        mock_c = {"resourceType": "Bundle", "entry": [{"resource": {"resourceType": "Condition", "id": "c1", "code": {"text": "Diabetes"}}}]}
        with patch("httpx.AsyncClient.request", new_callable=AsyncMock) as m:
            resp = MagicMock(); resp.status_code = 200; resp.json.return_value = mock_c
            m.return_value = resp
            res = await call_tool_direct(server, "search_conditions", {"patient": "Patient/123"})
            assert "Diabetes" in res

    # 8. Auth Manager Token Refresh (Mock)
    async def s8():
        setts = get_test_settings()
        setts.fhir_server_disable_authorization = False
        setts.fhir_server_auth_mode = "client_credentials"
        setts.fhir_server_token_url = "http://auth.com"
        setts.fhir_server_client_id = "test"
        setts.fhir_server_client_secret = "test"
        am = AuthManager(setts)
        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as m:
            resp = MagicMock(); resp.status_code = 200; resp.json.return_value = {"access_token": "abc", "expires_in": 3600}
            m.return_value = resp
            token = await am.get_token()
            assert token == "abc"

    # 9. Auth Failure Scenario
    async def s9():
        setts = get_test_settings()
        setts.fhir_server_disable_authorization = False
        setts.fhir_server_auth_mode = "authorization_code"
        am = AuthManager(setts)
        try:
            await am.get_token()
            assert False, "Should have failed"
        except Exception as e:
            assert "authorization_code mode requires" in str(e)

    # 10. Pagination Multi-page logic
    async def s10():
        settings = get_test_settings()
        am = AuthManager(settings)
        client = FHIRClient(settings, am)
        resp1_data = {"resourceType": "Bundle", "entry": [{"resource": {"id": "1"}}], "link": [{"relation": "next", "url": "http://hapi.fhir.org/baseR4/Patient?_getpages=abc&_getpagesoffset=1"}]}
        resp2_data = {"resourceType": "Bundle", "entry": [{"resource": {"id": "2"}}]}
        with patch("httpx.AsyncClient.request", new_callable=AsyncMock) as m:
            r1 = MagicMock(); r1.status_code = 200; r1.json.return_value = resp1_data
            r2 = MagicMock(); r2.status_code = 200; r2.json.return_value = resp2_data
            m.side_effect = [r1, r2]
            res = await client.search("Patient", {}, max_pages=2)
            assert len(res.data["entry"]) == 2

    scenarios = [
        ("Search Patient Tool", s1),
        ("Read Patient Tool", s2),
        ("Create Resource Tool", s3),
        ("Update Resource Tool", s4),
        ("Delete Resource Tool", s5),
        ("Capabilities Tool", s6),
        ("Search Conditions Tool", s7),
        ("Auth Refresh", s8),
        ("Auth Failure handling", s9),
        ("Search Pagination", s10),
    ]

    for name, coro_func in scenarios:
        results.append(await run_scenario(name, coro_func))
    
    print("\n" + "="*40)
    print(f"Final Report: {sum(results)}/10 Scenarios Passed")
    print("="*40)

if __name__ == "__main__":
    asyncio.run(main())
