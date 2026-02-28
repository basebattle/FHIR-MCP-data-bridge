from typing import Dict, Any, List, Optional
import datetime

class ResponseMapper:
    """Transforms raw FHIR resources into human-readable text for LLM consumption."""

    @staticmethod
    def map_bundle(bundle: Dict[str, Any], resource_type: str) -> str:
        """Map all entries in a FHIR Bundle using the appropriate mapper."""
        entries = bundle.get("entry", [])
        if not entries:
            return f"No {resource_type} resources found."

        results = []
        total = bundle.get("total")
        if total is not None:
            results.append(f"Found {total} {resource_type} resources (showing {len(entries)}):")
        else:
            results.append(f"Found {len(entries)} {resource_type} resources:")

        for i, entry in enumerate(entries, 1):
            resource = entry.get("resource")
            if not resource:
                continue
            
            mapped = ResponseMapper.map_resource(resource)
            results.append(f"\n{i}. {mapped}")

        return "\n".join(results)

    @staticmethod
    def map_resource(resource: Dict[str, Any]) -> str:
        rt = resource.get("resourceType")
        if rt == "Patient":
            return ResponseMapper.map_patient(resource)
        elif rt == "Condition":
            return ResponseMapper.map_condition(resource)
        elif rt == "Observation":
            return ResponseMapper.map_observation(resource)
        elif rt == "MedicationRequest":
            return ResponseMapper.map_medication_request(resource)
        elif rt == "Encounter":
            return ResponseMapper.map_encounter(resource)
        elif rt == "AllergyIntolerance":
            return ResponseMapper.map_allergy(resource)
        elif rt == "Procedure":
            return ResponseMapper.map_procedure(resource)
        elif rt == "CarePlan":
            return ResponseMapper.map_careplan(resource)
        else:
            return f"[{rt}] {resource.get('id', 'No ID')}"

    @staticmethod
    def map_patient(resource: Dict[str, Any]) -> str:
        pid = resource.get("id", "Unknown")
        name = ResponseMapper._get_name(resource)
        dob = resource.get("birthDate", "Unknown")
        gender = resource.get("gender", "Unknown")
        mrn = ResponseMapper._get_identifier(resource, "MRN")
        
        age_str = ""
        if dob != "Unknown":
            try:
                birth_date = datetime.date.fromisoformat(dob)
                today = datetime.date.today()
                age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
                age_str = f" (Age: {age})"
            except:
                pass

        return f"Patient/{pid}\n   Name: {name}\n   DOB: {dob}{age_str}\n   Gender: {gender.capitalize()}\n   MRN: {mrn}"

    @staticmethod
    def map_condition(resource: Dict[str, Any]) -> str:
        cid = resource.get("id", "Unknown")
        code_data = resource.get("code", {})
        display = code_data.get("text") or ResponseMapper._get_coding_display(code_data) or "Unknown Condition"
        status = resource.get("clinicalStatus", {}).get("coding", [{}])[0].get("code", "Unknown")
        onset = resource.get("onsetDateTime", resource.get("onsetString", "Unknown")).split("T")[0]
        
        return f"Condition/{cid}\n   Diagnosis: {display}\n   Onset: {onset} | Status: {status.capitalize()}"

    @staticmethod
    def map_observation(resource: Dict[str, Any]) -> str:
        oid = resource.get("id", "Unknown")
        code_data = resource.get("code", {})
        display = code_data.get("text") or ResponseMapper._get_coding_display(code_data) or "Unknown Observation"
        
        value = ""
        if "valueQuantity" in resource:
            vq = resource["valueQuantity"]
            value = f"{vq.get('value')} {vq.get('unit', vq.get('code', ''))}"
        elif "valueCodeableConcept" in resource:
            value = resource["valueCodeableConcept"].get("text") or ResponseMapper._get_coding_display(resource["valueCodeableConcept"])
        elif "valueString" in resource:
            value = resource["valueString"]
            
        date = resource.get("effectiveDateTime", resource.get("effectivePeriod", {}).get("start", "Unknown")).split("T")[0]
        
        return f"Observation/{oid}\n   Type: {display}\n   Value: {value}\n   Date: {date}"

    @staticmethod
    def map_medication_request(resource: Dict[str, Any]) -> str:
        mid = resource.get("id", "Unknown")
        med = resource.get("medicationCodeableConcept", {}).get("text") or \
              ResponseMapper._get_coding_display(resource.get("medicationCodeableConcept", {})) or \
              "Unknown Medication"
        status = resource.get("status", "Unknown")
        authored = resource.get("authoredOn", "Unknown").split("T")[0]
        
        dosage = ""
        instructions = resource.get("dosageInstruction", [])
        if instructions:
            dosage = instructions[0].get("text", "")
            
        return f"MedicationRequest/{mid}\n   Medication: {med}\n   Dosage: {dosage}\n   Status: {status.capitalize()} | Authored: {authored}"

    @staticmethod
    def map_encounter(resource: Dict[str, Any]) -> str:
        eid = resource.get("id", "Unknown")
        date = resource.get("period", {}).get("start", "Unknown").split("T")[0]
        eclass = resource.get("class", {}).get("code", "Unknown")
        status = resource.get("status", "Unknown")
        
        reason = ""
        reasons = resource.get("reasonCode", [])
        if reasons:
            reason = reasons[0].get("text") or ResponseMapper._get_coding_display(reasons[0]) or ""
            
        return f"Encounter/{eid}\n   Date: {date} | Class: {eclass} | Status: {status.capitalize()}\n   Reason: {reason}"

    @staticmethod
    def map_allergy(resource: Dict[str, Any]) -> str:
        aid = resource.get("id", "Unknown")
        substance = resource.get("code", {}).get("text") or ResponseMapper._get_coding_display(resource.get("code", {})) or "Unknown Substance"
        status = resource.get("clinicalStatus", {}).get("coding", [{}])[0].get("code", "Unknown")
        criticality = resource.get("criticality", "Unknown")
        
        reaction = ""
        reactions = resource.get("reaction", [])
        if reactions:
            manifestations = reactions[0].get("manifestation", [])
            if manifestations:
                reaction = manifestations[0].get("text") or ResponseMapper._get_coding_display(manifestations[0]) or ""
                
        return f"AllergyIntolerance/{aid}\n   Substance: {substance}\n   Reaction: {reaction} | Status: {status.capitalize()} | Criticality: {criticality.capitalize()}"

    @staticmethod
    def map_procedure(resource: Dict[str, Any]) -> str:
        pid = resource.get("id", "Unknown")
        display = resource.get("code", {}).get("text") or ResponseMapper._get_coding_display(resource.get("code", {})) or "Unknown Procedure"
        status = resource.get("status", "Unknown")
        date = resource.get("performedDateTime", resource.get("performedPeriod", {}).get("start", "Unknown")).split("T")[0]
        
        return f"Procedure/{pid}\n   Procedure: {display}\n   Date: {date} | Status: {status.capitalize()}"

    @staticmethod
    def map_careplan(resource: Dict[str, Any]) -> str:
        cpid = resource.get("id", "Unknown")
        status = resource.get("status", "Unknown")
        title = resource.get("title", "Unknown Care Plan")
        category = ""
        categories = resource.get("category", [])
        if categories:
            category = categories[0].get("text") or ResponseMapper._get_coding_display(categories[0]) or ""
            
        return f"CarePlan/{cpid}\n   Title: {title}\n   Category: {category} | Status: {status.capitalize()}"

    # Helper methods
    @staticmethod
    def _get_name(resource: Dict[str, Any]) -> str:
        names = resource.get("name", [])
        if not names:
            return "Unknown"
        
        n = names[0]
        family = n.get("family", "")
        givens = n.get("given", [])
        given = " ".join(givens)
        suffix = " ".join(n.get("suffix", []))
        
        full = f"{given} {family}".strip()
        if suffix:
            full += f", {suffix}"
        return full or "Unknown"

    @staticmethod
    def _get_identifier(resource: Dict[str, Any], system_keyword: str) -> str:
        ids = resource.get("identifier", [])
        for i in ids:
            system = i.get("system", "").lower()
            if system_keyword.lower() in system:
                return i.get("value", "Unknown")
        if ids:
            return ids[0].get("value", "Unknown")
        return "Unknown"

    @staticmethod
    def _get_coding_display(concept: Dict[str, Any]) -> Optional[str]:
        codings = concept.get("coding", [])
        if codings:
            return codings[0].get("display")
        return None
