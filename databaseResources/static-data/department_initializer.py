import json as js
import os
import sys

import supabase as sb
from dotenv import load_dotenv
import glob

from postgrest import APIError

# Load environment variables from a .env file (optional, but recommended)
load_dotenv()

SUPABASE_URL = os.environ.get("EXPO_PUBLIC_SUPABASE_URL", "YOUR_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("EXPO_PUBLIC_SUPABASE_ANON_KEY", "YOUR_SUPABASE_ANON_KEY")


supabase: sb.Client = sb.create_client(SUPABASE_URL, SUPABASE_KEY)

if supabase:
    print("Connected to Supabase!")
else:
    print("Failed to connect to Supabase.")

department_files = [file for file in glob.glob("./departments/*.json")]

departments = []

for file in department_files:
    with open(file, "r") as open_file:
        data = js.load(open_file)

        departments.extend(data)

for department in departments:
    try:
        new_department = {"dpmt_name": department['dpmt_name']}
        print(supabase.table("camp_dpmt").insert(new_department).execute().data)
    except APIError as api:
        print(f"API ERROR DETECTED: {api.message}", file=sys.stderr)
    except Exception as e:
        print(f"GENERAL ERROR DETECTED: {e}", file=sys.stderr)

