import csv
import re
import os

CSV_PATH = '/Users/vytvytskyi/spain admin/dbo-properties-2-live.1766704662.csv'
MOCK_DATA_PATH = '/Users/vytvytskyi/spain admin/src/components/properties/mockData.ts'
TEMP_OUTPUT_PATH = '/Users/vytvytskyi/spain admin/src/components/properties/mockData_repaired.ts'

def get_coordinates_map():
    coords_map = {}
    if not os.path.exists(CSV_PATH):
        print(f"Error: {CSV_PATH} not found.")
        return coords_map

    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader, None)
        
        try:
            old_id_idx = header.index('property_old_id')
            lat_idx = header.index('latitude')
            lon_idx = header.index('longitude')
        except (ValueError, AttributeError):
            old_id_idx = 1
            lat_idx = 14
            lon_idx = 15
        
        for row in reader:
            if len(row) <= max(old_id_idx, lat_idx, lon_idx):
                continue
            
            ref_id = row[old_id_idx]
            lat = row[lat_idx]
            lon = row[lon_idx]
            
            try:
                float(lat)
                float(lon)
                coords_map[ref_id] = (lat, lon)
            except ValueError:
                continue
                    
    print(f"Loaded coordinates for {len(coords_map)} properties from CSV.")
    return coords_map

def repair_mock_data(coords_map):
    if not os.path.exists(MOCK_DATA_PATH):
        print(f"Error: {MOCK_DATA_PATH} not found.")
        return

    print("Repairing mock data (removing misplaced coords and adding them correctly)...")
    
    with open(MOCK_DATA_PATH, 'r', encoding='utf-8') as f_in, \
         open(TEMP_OUTPUT_PATH, 'w', encoding='utf-8') as f_out:
        
        buffer = []
        in_project = False
        current_ref_id = None
        updated_count = 0
        
        for line in f_in:
            # Check for project start (4 spaces followed by {)
            if line.startswith('    {') and not in_project:
                in_project = True
                buffer = [line]
                current_ref_id = None
                continue
            
            if in_project:
                # Check for project end (4 spaces followed by } or },)
                if line.strip() in ['},', '}'] and line.startswith('    '):
                    # End of project!
                    
                    # 1. Add coordinates if we have a ref_id
                    if current_ref_id and current_ref_id in coords_map:
                        lat, lon = coords_map[current_ref_id]
                        
                        # Find last non-empty line in buffer to add a comma if missing
                        last_content_idx = -1
                        for i in range(len(buffer) - 1, -1, -1):
                            if buffer[i].strip():
                                last_content_idx = i
                                break
                        
                        if last_content_idx != -1:
                            if not buffer[last_content_idx].rstrip().endswith(',') and not buffer[last_content_idx].rstrip().endswith('{') and not buffer[last_content_idx].rstrip().endswith('['):
                                buffer[last_content_idx] = buffer[last_content_idx].rstrip() + ",\n"
                        
                        buffer.append(f'        "latitude": {lat},\n')
                        buffer.append(f'        "longitude": {lon}\n')
                        updated_count += 1
                    
                    # 2. Write buffer and closing line
                    for l in buffer:
                        f_out.write(l)
                    f_out.write(line)
                    
                    # 3. Reset
                    buffer = []
                    in_project = False
                    current_ref_id = None
                else:
                    # Inside project
                    # Skip any existing misplaced coordinates (clean up)
                    if '"latitude":' in line or '"longitude":' in line:
                        continue
                    
                    # Capture ref_id
                    ref_match = re.search(r'"reference_id":\s*"(R\d+)"', line)
                    if ref_match:
                        current_ref_id = ref_match.group(1)
                    
                    buffer.append(line)
            else:
                # Outside project (header, footer, etc.)
                f_out.write(line)
                
    print(f"Successfully placed coordinates for {updated_count} projects.")
    
    os.replace(TEMP_OUTPUT_PATH, MOCK_DATA_PATH)
    print("File saved and repaired.")

if __name__ == "__main__":
    coords = get_coordinates_map()
    repair_mock_data(coords)
