from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # FHIR Server Settings
    fhir_server_base_url: str = "https://hapi.fhir.org/baseR4"
    fhir_server_disable_authorization: bool = True
    fhir_server_auth_mode: str = "client_credentials"  # client_credentials or authorization_code
    fhir_server_client_id: Optional[str] = None
    fhir_server_client_secret: Optional[str] = None
    fhir_server_token_url: Optional[str] = None
    fhir_server_authorize_url: Optional[str] = None
    fhir_server_scopes: str = "user/Patient.read user/Condition.read user/Observation.read"
    fhir_request_timeout: int = 10

    # MCP Server Settings
    mcp_server_host: str = "localhost"
    mcp_server_port: int = 8000
    mcp_transport: str = "stdio"  # stdio or sse

    # Terminology Settings
    nlm_api_key: Optional[str] = None
    loinc_username: Optional[str] = None
    loinc_password: Optional[str] = None

    # Logging
    log_level: str = "INFO"

    # DeepSense Intelligence V2
    deepsense_api_key: Optional[str] = None
