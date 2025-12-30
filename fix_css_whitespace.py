
import re
import os

file_path = "src/app/globals.css"
abs_path = os.path.abspath(file_path)

with open(abs_path, "r") as f:
    content = f.read()

# Fix hover: space
new_content = re.sub(r"hover:\s+", "hover:", content)
# Fix focus: space (saw one in line 702)
new_content = re.sub(r"focus:\s+", "focus:", new_content)
# Fix dark: space (just in case)
new_content = re.sub(r"dark:\s+", "dark:", new_content)
# Fix active: space
new_content = re.sub(r"active:\s+", "active:", new_content)

with open(abs_path, "w") as f:
    f.write(new_content)

print("Global whitespace fix applied.")
