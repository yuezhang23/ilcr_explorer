#!/usr/bin/env python3
"""
Script to update prompt values in JSONL files.
Reads each line, parses JSON, ignores current prompt value,
and reassigns starting from 0 with incrementing values.
"""

import json
import sys
import os
from typing import Dict, Any

def update_prompt_values(input_file: str, output_file: str = None) -> None:
    """
    Update prompt values in a JSONL file.
    
    Args:
        input_file: Path to the input JSONL file
        output_file: Path to the output JSONL file (optional, defaults to input_file with '_updated' suffix)
    """
    if output_file is None:
        # Create output filename by adding '_updated' before the extension
        base_name, ext = os.path.splitext(input_file)
        output_file = f"{base_name}_updated{ext}"
    
    prompt_counter = 0
    
    try:
        with open(input_file, 'r', encoding='utf-8') as infile, \
             open(output_file, 'w', encoding='utf-8') as outfile:
            
            for line_num, line in enumerate(infile, 1):
                line = line.strip()
                if not line:  # Skip empty lines
                    continue
                
                try:
                    # Parse the JSON object
                    data = json.loads(line)
                    
                    # Check if 'prompt' key exists
                    if 'prompt' in data:
                        # Reassign prompt value starting from 0
                        data['prompt'] = str(prompt_counter)
                        prompt_counter += 1
                        if prompt_counter == 8:
                            prompt_counter = 0
                    
                    # Write the updated JSON object to output file
                    json.dump(data, outfile, ensure_ascii=False)
                    outfile.write('\n')
                    
                except json.JSONDecodeError as e:
                    print(f"Error parsing JSON on line {line_num}: {e}")
                    print(f"Line content: {line[:100]}...")
                    continue
        
        print(f"Successfully processed {prompt_counter} lines")
        print(f"Input file: {input_file}")
        print(f"Output file: {output_file}")
        
    except FileNotFoundError:
        print(f"Error: Input file '{input_file}' not found.")
        sys.exit(1)
    except Exception as e:
        print(f"Error processing file: {e}")
        sys.exit(1)

def main():
    """Main function to handle command line arguments."""
    if len(sys.argv) < 2:
        print("Usage: python update_prompt_values.py <input_file> [output_file]")
        print("Example: python update_prompt_values.py result_no_rebut.jsonl")
        print("Example: python update_prompt_values.py result_no_rebut.jsonl result_updated.jsonl")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    update_prompt_values(input_file, output_file)

if __name__ == "__main__":
    main() 