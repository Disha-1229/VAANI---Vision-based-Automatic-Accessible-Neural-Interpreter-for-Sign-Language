from typing import Any, Dict, Optional, Tuple


def extract_best_prediction(results: Any) -> Tuple[Optional[str], float]:
    if not results:
        return None, 0.0

    result = results[0]
    if result.boxes is None or len(result.boxes) == 0:
        return None, 0.0

    top_box = result.boxes[0]
    class_id = int(top_box.cls.item())
    confidence = float(top_box.conf.item())
    label = result.names.get(class_id, "Unknown")
    return str(label).upper(), confidence


def build_prediction_payload(
    label: Optional[str], confidence: float, gif_map: Dict[str, str]
) -> Dict[str, Any]:
    if not label:
        return {"label": None, "confidence": 0.0, "gif_url": None}

    return {
        "label": label,
        "confidence": round(confidence, 4),
        "gif_url": gif_map.get(label),
    }
