#!/usr/bin/env python3
import json
import sys
import asyncio
import inspect
from typing import Dict, Any, Callable, List, Optional, Union
import unitree_auth

# Registry to store functions
registered_functions: Dict[str, Callable] = {}

def register(func):
    """Decorator to register a function with the RPC system"""
    registered_functions[func.__name__] = func
    return func

async def handle_rpc(request: Dict[str, Any]) -> Any:
    """Handle an RPC request"""
    function_name = request.get("functionName")
    args = request.get("args", [])
    
    if not function_name:
        return {"error": "No function name specified"}
    
    if function_name not in registered_functions:
        return {"error": f"Function '{function_name}' not found"}
    
    func = registered_functions[function_name]
    
    try:
        if inspect.iscoroutinefunction(func):
            # Handle async functions
            result = await func(*args)
        else:
            # Handle synchronous functions
            result = func(*args)
        return {"result": result}
    except Exception as e:
        return {"error": f"Error executing function: {str(e)}"}

async def main():
    if len(sys.argv) != 2:
        print("Usage: clirpc.py <json_request>")
        sys.exit(1)
    
    try:
        request = json.loads(sys.argv[1])
        result = await handle_rpc(request)
        print(json.dumps(result))
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}))



register(unitree_auth.send_sdp_to_local_peer_new_method)        

        
# Example functions - replace with your own
@register
def add(a, b):
    """Add two numbers"""
    return a + b

@register
async def fetch_data(url):
    """Fetch data from a URL (example async function)"""
    # This is just a placeholder for an async function
    # In a real application, you might use aiohttp or similar
    await asyncio.sleep(1)  # Simulate network delay
    return f"Data from {url}"

if __name__ == "__main__":
    asyncio.run(main())
