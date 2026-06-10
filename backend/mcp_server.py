import os
import sys

# Add the parent directory of the backend to the system path to allow absolute package imports
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(CURRENT_DIR)
if PARENT_DIR not in sys.path:
    sys.path.insert(0, PARENT_DIR)

from mcp.server.fastmcp import FastMCP
from backend.mcp.tools import find_hospital, dispatch_emergency, notify_family, create_hazard_report

# Initialize the FastMCP server
mcp = FastMCP("RoadGuardian Emergency Tools Server")

@mcp.tool()
async def locate_nearest_hospital(lat: float, lng: float) -> dict:
    """
    Finds the nearest trauma hospital based on GPS coordinates.
    Useful for dispatching help or directing a patient to nearby care.
    """
    return await find_hospital(lat, lng)

@mcp.tool()
async def dispatch_ambulance(hospital_name: str, lat: float, lng: float) -> dict:
    """
    Dispatches a rapid responder/ambulance from the specified hospital to the coordinates.
    """
    return await dispatch_emergency(hospital_name, lat, lng)

@mcp.tool()
async def notify_family_contacts(contact_info: str) -> dict:
    """
    Sends emergency SMS alerts to the victim's family contacts.
    """
    return await notify_family(contact_info)

@mcp.tool()
async def report_hazard(hazard_type: str, lat: float, lng: float, severity: str) -> dict:
    """
    Logs and pinpoints a road hazard alert on the shared emergency dashboard.
    """
    return await create_hazard_report(hazard_type, lat, lng, severity)

if __name__ == "__main__":
    mcp.run()
