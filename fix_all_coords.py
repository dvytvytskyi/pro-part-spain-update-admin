import csv
import re
import os

CSV_PATH = '/Users/vytvytskyi/spain admin/dbo-properties-2-live.1766704662.csv'
MOCK_DATA_PATH = '/Users/vytvytskyi/spain admin/src/components/properties/mockData.ts'
TEMP_OUTPUT_PATH = '/Users/vytvytskyi/spain admin/src/components/properties/mockData_updated.ts'

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

def update_mock_data(coords_map):
    if not os.path.exists(MOCK_DATA_PATH):
        print(f"Error: {MOCK_DATA_PATH} not found.")
        return

    print("Updating mock data for ALL properties...")
    updated_count = 0
    already_had_count = 0
    
    with open(MOCK_DATA_PATH, 'r', encoding='utf-8') as f_in, \
         open(TEMP_OUTPUT_PATH, 'w', encoding='utf-8') as f_out:
        
        buffer = []
        current_ref_id = None
        
        for line in f_in:
            buffer.append(line)
            
            ref_match = re.search(r'"reference_id":\s*"(R\d+)"', line)
            if ref_match:
                current_ref_id = ref_match.group(1)
            
            if re.match(r'\s*},?', line):
                if current_ref_id and current_ref_id in coords_map:
                    lat, lon = coords_map[current_ref_id]
                    
                    has_lat = any('"latitude":' in l for l in buffer)
                    has_lon = any('"longitude":' in l for l in buffer)
                    has_coords = any('"coordinates":' in l for l in buffer)
                    
                    if not has_lat and not has_lon and not has_coords:
                        closing_line = buffer.pop()
                        
                        last_content_idx = -1
                        for i in range(len(buffer) - 1, -1, -1):
                            if buffer[i].strip():
                                last_content_idx = i
                                break
                        
                        if last_content_idx != -1:
                            if not buffer[last_content_idx].rstrip().endswith(',') and not buffer[last_content_idx].rstrip().endswith('{'):
                                buffer[last_content_idx] = buffer[last_content_idx].rstrip() + ",\n"
                        
                        buffer.append(f'        "latitude": {lat},\n')
                        buffer.append(f'        "longitude": {lon}\n')
                        buffer.append(closing_line)
                        updated_count += 1
                    else:
                        already_had_count += 1
                        
                for l in buffer:
                    f_out.write(l)
                buffer = []
                current_ref_id = None
        
        for l in buffer:
            f_out.write(l)
            
    print(f"Newly updated {updated_count} projects.")
    print(f"Skipped {already_had_count} projects that already had coordinates.")
    
    os.replace(TEMP_OUTPUT_PATH, MOCK_DATA_PATH)
    print("File saved.")

if __name__ == "__main__":
    coords = get_coordinates_map()
    update_mock_data(coords)
