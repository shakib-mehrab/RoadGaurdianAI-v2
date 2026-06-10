from fastmcp import FastMCP
from pydantic import BaseModel
import datetime

mcp = FastMCP("crashsense-telemetry-tools")


class SensorReading(BaseModel):
    ax: float   # accelerometer x-axis (g force)
    ay: float   # accelerometer y-axis (g force)
    az: float   # accelerometer z-axis (g force)
    gx: float   # gyroscope x (degrees per second)
    gy: float   # gyroscope y (degrees per second)
    gz: float   # gyroscope z (degrees per second)
    timestamp: str   # ISO format string


@mcp.tool()
def analyze_crash_telemetry(reading: SensorReading) -> dict:
    """
    Analyzes raw IMU sensor data to detect crash events.
    Returns severity classification and G-force measurement.
    """
    magnitude = (reading.ax**2 + reading.ay**2 + reading.az**2) ** 0.5

    if magnitude > 6.0:
        severity = "critical"
    elif magnitude > 3.5:
        severity = "moderate"
    else:
        severity = "none"

    return {
        "crash_detected": magnitude > 3.5,
        "severity": severity,
        "impact_g_force": round(magnitude, 2),
        "timestamp": reading.timestamp,
        "trigger_sos": magnitude > 3.5,
    }


@mcp.tool()
def get_crash_threshold_config() -> dict:
    """Returns current CrashSense detection thresholds."""
    return {
        "impact_threshold_g": 3.5,
        "critical_threshold_g": 6.0,
        "sample_rate_hz": 50,
        "detection_window_ms": 200,
        "sos_countdown_seconds": 30,
    }


@mcp.tool()
def log_crash_event(
    user_id: str, severity: str, lat: float, lng: float
) -> dict:
    """Logs a confirmed crash event and returns an incident ID."""
    timestamp = datetime.datetime.utcnow().strftime("%Y%m%d%H%M%S")
    incident_id = f"INC-{timestamp}-{user_id[:6].upper()}"
    return {
        "logged": True,
        "incident_id": incident_id,
        "user_id": user_id,
        "severity": severity,
        "location": {"lat": lat, "lng": lng},
        "timestamp": datetime.datetime.utcnow().isoformat(),
    }


if __name__ == "__main__":
    mcp.run(transport="stdio")
