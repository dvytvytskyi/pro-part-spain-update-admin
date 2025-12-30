
import re
import os

file_path = "src/app/globals.css"
abs_path = os.path.abspath(file_path)

with open(abs_path, "r") as f:
    content = f.read()

# Fix breakpoint spaces
# Matches sm:  !class -> sm:!class
# Matches md:  text-white -> md:text-white
pattern = r"(sm|md|lg|xl|2xl|2xsm):\s+"
new_content = re.sub(pattern, lambda m: m.group(1) + ":", content)

with open(abs_path, "w") as f:
    f.write(new_content)

print("Breakpoint whitespace fix applied.")
