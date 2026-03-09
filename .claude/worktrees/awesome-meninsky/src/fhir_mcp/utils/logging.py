import logging
import json
import sys
from typing import Any, Dict

class JSONFormatter(logging.Formatter):
    """Structured JSON formatter for production-ready logging."""
    def format(self, record: logging.LogRecord) -> str:
        log_entry: Dict[str, Any] = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "funcName": record.funcName,
        }
        
        # Redact potentially sensitive info if present in extra
        if hasattr(record, "fhir_details"):
            # Simple redaction logic could go here if we had identifying info in extras
            log_entry["details"] = record.fhir_details

        return json.dumps(log_entry)

def setup_logging(level: str = "INFO"):
    """Configures the root logger with a JSON formatter."""
    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(JSONFormatter())
    
    logger = logging.getLogger("fhir_mcp")
    logger.setLevel(level.upper())
    logger.addHandler(handler)
    # Prevent propagation to parent loggers to avoid duplicate logs in some environments
    logger.propagate = False
    
    return logger

# Create a default logger instance
logger = logging.getLogger("fhir_mcp")
