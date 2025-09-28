"""Database utility for pico

This module provides a PicoDB class that encapsulates the previous
module-level functions so you can create an instance on import:

    from db import PicoDB
    db = PicoDB()


"""

import json
import circuitpython_uuid4 as uuid


class PicoDB:
    """Encapsulate file-based table management for Pico.

    Attributes:
        is_pico (bool): whether paths should point to MicroPython /sd/ location.
        table_list_file (str): path to the JSON file containing table list.
    """

    def __init__(self, is_pico: bool = True, table_list_file: str = "pico_tables.json"):
        self.is_pico = is_pico
        self.table_list_file = table_list_file
        if self.is_pico:
            self.table_list_file = "/sd/pico_tables.json"

    def set_is_pico(self, value: bool):
        """Toggle Pico mode (affects default file paths)."""
        self.is_pico = value
        if self.is_pico:
            self.table_list_file = "/sd/pico_tables.json"
        else :
            self.table_list_file = "pico_tables.json"

    def _resolve_table_list_file(self) -> str:
        """Return the active path for the table list file."""
        return self.table_list_file

    def get_tables(self):
        """Retrieve the list of tables from the JSON file.

        Returns an empty list if the file cannot be read or parsed.
        """
        table_file = self._resolve_table_list_file()
        try:
            with open(table_file, "r") as f:
                tables = json.load(f)
                return tables
        except (OSError, ValueError):
            return []

    def set_tables(self, tables):
        """Write the provided tables list to the table-list JSON file."""
        table_file = self._resolve_table_list_file()
        try:
            with open(table_file, "w") as f:
                json.dump(tables, f)
        except (OSError, ValueError):
            # Best-effort: ignore write failures on Pico
            pass

    def create_table(self, table_name: str) -> bool:
        """Create a new table and add it to the list of tables.

        Returns True if created, False if the table already existed.
        """
        tables = self.get_tables()
        if table_name in tables:
            return False

        tables.append(table_name)
        # Persist updated table list
        self.set_tables(tables)

        # Create an empty file for the new table
        table_file = f"{table_name}.json"
        if self.is_pico:
            table_file = f"/sd/{table_file}"

        try:
            with open(table_file, "w") as f:
                json.dump({}, f)
        except (OSError, ValueError):
            pass

        return True
    
    def add_entry(self, table_name: str, entry: dict, id: str) -> bool:
        """Add an entry to the specified table.

        Returns True if the entry was added, False if the table does not exist.
        """
        tables = self.get_tables()
        if table_name not in tables:
            return False

        table_file = f"{table_name}.json"
        if self.is_pico:
            table_file = f"/sd/{table_file}"

        try:
            with open(table_file, "r") as f:
                entries = json.load(f)
        except (OSError, ValueError):
            entries = {}

        if not id:
            id = uuid.generate_uuid_v4()

        entries[id] = entry

        try:
            with open(table_file, "w") as f:
                json.dump(entries, f)
        except (OSError, ValueError):
            pass

        return True
    
    def get_entry(self, table_name: str, id: str) :
        """Retrieve an entry by ID from the specified table.

        Returns the entry if found, or None if the table or entry does not exist.
        """
        tables = self.get_tables()
        if table_name not in tables:
            return None

        table_file = f"{table_name}.json"
        if self.is_pico:
            table_file = f"/sd/{table_file}"

        try:
            with open(table_file, "r") as f:
                entries = json.load(f)
        except (OSError, ValueError):
            return None

        return entries.get(id, None)
    
    def get_all_entries(self, table_name: str) -> dict:
        """Retrieve all entries from the specified table.

        Returns a dictionary of entries, or an empty dictionary if the table
        does not exist or cannot be read.
        """
        tables = self.get_tables()
        if table_name not in tables:
            return {}

        table_file = f"{table_name}.json"
        if self.is_pico:
            table_file = f"/sd/{table_file}"

        try:
            with open(table_file, "r") as f:
                entries = json.load(f)
                return entries
        except (OSError, ValueError):
            return {}
    
    def update_entry(self, table_name: str, id: str, updated_entry: dict) -> bool:
        """Update an existing entry in the specified table.

        Returns True if the entry was updated, False if the table or entry does not exist.
        """
        tables = self.get_tables()
        if table_name not in tables:
            return False

        table_file = f"{table_name}.json"
        if self.is_pico:
            table_file = f"/sd/{table_file}"

        try:
            with open(table_file, "r") as f:
                entries = json.load(f)
        except (OSError, ValueError):
            return False

        if id not in entries:
            return False

        entry_to_update = entries[id]
        for k, v in updated_entry.items():
            entry_to_update[k] = v

        entries[id] = entry_to_update

        try:
            with open(table_file, "w") as f:
                json.dump(entries, f)
        except (OSError, ValueError):
            pass

        return True
    
    def delete_entry(self, table_name: str, id: str) -> bool:
        """Delete an entry by ID from the specified table.

        Returns True if the entry was deleted, False if the table or entry does not exist.
        """
        tables = self.get_tables()
        if table_name not in tables:
            return False

        table_file = f"{table_name}.json"
        if self.is_pico:
            table_file = f"/sd/{table_file}"

        try:
            with open(table_file, "r") as f:
                entries = json.load(f)
        except (OSError, ValueError):
            return False

        if id not in entries:
            return False

        del entries[id]

        try:
            with open(table_file, "w") as f:
                json.dump(entries, f)
        except (OSError, ValueError):
            pass

        return True