class FHIRMCPError(Exception):
    """Base exception for all server errors."""
    def __init__(self, message: str, details: str = ""):
        super().__init__(message)
        self.message = message
        self.details = details

class FHIRConnectionError(FHIRMCPError):
    """FHIR server unreachable or timeout."""
    pass

class FHIRAuthError(FHIRMCPError):
    """Authentication or authorization failure."""
    pass

class FHIRNotFoundError(FHIRMCPError):
    """Requested resource not found (404)."""
    pass

class FHIRValidationError(FHIRMCPError):
    """FHIR server returned OperationOutcome with errors."""
    pass

class TerminologyError(FHIRMCPError):
    """Terminology lookup failure."""
    pass
