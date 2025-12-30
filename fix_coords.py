import csv
import re
import os

NEW_BUILDING_IDS_PATH = '/Users/vytvytskyi/spain admin/src/data/newBuildingIds.ts'
CSV_PATH = '/Users/vytvytskyi/spain admin/dbo-properties-2-live.1766704662.csv'
MOCK_DATA_PATH = '/Users/vytvytskyi/spain admin/src/components/properties/mockData.ts'
TEMP_OUTPUT_PATH = '/Users/vytvytskyi/spain admin/src/components/properties/mockData_updated.ts'

def get_new_building_ids():
    ids = set()
    if not os.path.exists(NEW_BUILDING_IDS_PATH):
        print(f"Error: {NEW_BUILDING_IDS_PATH} not found.")
        return ids
        
    with open(NEW_BUILDING_IDS_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
        # Extract R-codes using regex from the array
        matches = re.findall(r'"(R\d+)"', content)
        ids.update(matches)
    print(f"Loaded {len(ids)} new building IDs.")
    return ids

def get_coordinates_map(target_ids):
    coords_map = {}
    if not os.path.exists(CSV_PATH):
        print(f"Error: {CSV_PATH} not found.")
        return coords_map

    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        # Check if first line is header
        # Based on inspection, line 1 is header
        reader = csv.reader(f)
        header = next(reader, None)
        
        # Identify indices
        try:
            old_id_idx = header.index('property_old_id')
            lat_idx = header.index('latitude')
            lon_idx = header.index('longitude')
        except ValueError:
            # Fallback if header is different or missing, based on observation
            # property_old_id is index 1, lat is 14, lon is 15
            old_id_idx = 1
            lat_idx = 14
            lon_idx = 15
        
        for row in reader:
            if len(row) <= max(old_id_idx, lat_idx, lon_idx):
                continue
            
            ref_id = row[old_id_idx]
            if ref_id in target_ids:
                lat = row[lat_idx]
                lon = row[lon_idx]
                
                # Check if valid numbers
                try:
                    float(lat)
                    float(lon)
                    # Store as valid JSON numbers (strings) to write directly
                    coords_map[ref_id] = (lat, lon)
                except ValueError:
                    continue
                    
    print(f"Found coordinates for {len(coords_map)} properties.")
    return coords_map

def update_mock_data(coords_map):
    if not os.path.exists(MOCK_DATA_PATH):
        print(f"Error: {MOCK_DATA_PATH} not found.")
        return

    print("Updating mock data...")
    updated_count = 0
    
    with open(MOCK_DATA_PATH, 'r', encoding='utf-8') as f_in, \
         open(TEMP_OUTPUT_PATH, 'w', encoding='utf-8') as f_out:
        
        buffer = []
        current_ref_id = None
        
        for line in f_in:
            buffer.append(line)
            
            # Check for reference_id
            ref_match = re.search(r'"reference_id":\s*"(R\d+)"', line)
            if ref_match:
                current_ref_id = ref_match.group(1)
            
            # Check for end of object
            # Defined by '    },' with optional comma 
            if re.match(r'\s*},?', line):
                # End of object reached. Process buffer.
                if current_ref_id and current_ref_id in coords_map:
                    lat, lon = coords_map[current_ref_id]
                    
                    # Check if lat/lon already exist in buffer
                    has_lat = any('"latitude":' in l for l in buffer)
                    has_lon = any('"longitude":' in l for l in buffer)
                    
                    if not has_lat and not has_lon:
                        # Insert before the closing brace (last line of buffer)
                        # Ensure previous line has comma
                        closing_line = buffer.pop() # This is '    },' or similar
                        
                        # Find last non-empty line to append comma
                        last_content_idx = -1
                        for i in range(len(buffer) - 1, -1, -1):
                            if buffer[i].strip():
                                last_content_idx = i
                                break
                        
                        if last_content_idx != -1:
                            if not buffer[last_content_idx].rstrip().endswith(',') and not buffer[last_content_idx].rstrip().endswith('{'):
                                # Add comma
                                buffer[last_content_idx] = buffer[last_content_idx].rstrip() + ",\n"
                        
                        # Add coordinates
                        buffer.append(f'        "latitude": {lat},\n')
                        buffer.append(f'        "longitude": {lon}\n')
                        buffer.append(closing_line)
                        updated_count += 1
                        
                # Write buffer and reset
                for l in buffer:
                    f_out.write(l)
                buffer = []
                current_ref_id = None
        
        # Write any remaining lines
        for l in buffer:
            f_out.write(l)
            
    print(f"Updated {updated_count} projects.")
    
    # Replace original file
    os.replace(TEMP_OUTPUT_PATH, MOCK_DATA_PATH)
    print("File saved.")

if __name__ == "__main__":
    ids = get_new_building_ids()
    coords = get_coordinates_map(ids)
    update_mock_data(coords)
