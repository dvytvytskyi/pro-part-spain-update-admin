import csv
import re
import os

CSV_PATH = '/Users/vytvytskyi/spain admin/dbo-properties-2-live.1766704662.csv'
MOCK_DATA_PATH = '/Users/vytvytskyi/spain admin/src/components/properties/mockData.ts'
TEMP_OUTPUT_PATH = '/Users/vytvytskyi/spain admin/src/components/properties/mockData_final.ts'

def get_coordinates_map():
    coords_map = {}
    if not os.path.exists(CSV_PATH):
        return coords_map
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader, None)
        try:
            old_id_idx = header.index('property_old_id')
            lat_idx = header.index('latitude')
            lon_idx = header.index('longitude')
        except:
            old_id_idx, lat_idx, lon_idx = 1, 14, 15
        for row in reader:
            if len(row) > max(old_id_idx, lat_idx, lon_idx):
                ref_id = row[old_id_idx]
                try:
                    float(row[lat_idx])
                    float(row[lon_idx])
                    coords_map[ref_id] = (row[lat_idx], row[lon_idx])
                except: continue
    return coords_map

def clean_and_sync():
    coords_map = get_coordinates_map()
    print(f"Loaded {len(coords_map)} coords from CSV.")
    
    with open(MOCK_DATA_PATH, 'r', encoding='utf-8') as f_in, \
         open(TEMP_OUTPUT_PATH, 'w', encoding='utf-8') as f_out:
        
        buffer = []
        depth = 0
        current_ref_id = None
        
        for line in f_in:
            # Clean up ANY existing latitude/longitude entries
            if '"latitude":' in line or '"longitude":' in line:
                continue
                
            stripped = line.strip()
            
            # Count depth for project objects
            # Outer array is depth 0. Projects are at depth 1.
            if stripped.startswith('{'):
                depth += 1
            
            # Capture ref_id if we are inside a project (depth >= 1)
            if depth >= 1:
                ref_match = re.search(r'"reference_id":\s*"(R\d+)"', line)
                if ref_match:
                    current_ref_id = ref_match.group(1)
            
            if stripped.startswith('}') or stripped.startswith('},'):
                depth -= 1
                # If we just closed a project (back to depth 0 or if we were at depth 1)
                # Wait, the projects are items in a list, so they are at depth 1.
                # When depth goes from 1 to 0, it's the end of a project.
                if depth == 0 and current_ref_id:
                    # Append coordinates to the LAST item in buffer before closing it
                    lat, lon = coords_map.get(current_ref_id, (None, None))
                    if lat and lon:
                        # Add comma to the last line in buffer if needed
                        last_idx = -1
                        for i in range(len(buffer)-1, -1, -1):
                            if buffer[i].strip():
                                last_idx = i
                                break
                        if last_idx != -1:
                            if not buffer[last_idx].rstrip().endswith(',') and not buffer[last_idx].rstrip().endswith('{') and not buffer[last_idx].rstrip().endswith('['):
                                buffer[last_idx] = buffer[last_idx].rstrip() + ",\n"
                        
                        buffer.append(f'        "latitude": {lat},\n')
                        buffer.append(f'        "longitude": {lon}\n')
                    
                    # Write everything and reset
                    for l in buffer: f_out.write(l)
                    f_out.write(line)
                    buffer = []
                    current_ref_id = None
                    continue
            
            if depth >= 1:
                buffer.append(line)
            else:
                f_out.write(line)

    os.replace(TEMP_OUTPUT_PATH, MOCK_DATA_PATH)
    print("Done. Cleaned and synced.")

if __name__ == "__main__":
    clean_and_sync()
