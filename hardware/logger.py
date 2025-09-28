"""
Logging utility for Pico from scratch
"""

import time

class Logger:
    """
    Logging utility for Pico
    """
    def __init__(self, log_file="/sd/pico_log.txt", is_pico=True):
        self.log_file = log_file
        self.is_pico = is_pico

    def set_is_pico(self, value: bool):
        self.is_pico = value

    def log(self, message):
        """Log a message to the log file with a timestamp"""


        timestamp = time.monotonic()

        if not self.is_pico:
            print(f"[{timestamp}] {message}\n")
            return

        with open(self.log_file, "a") as f:
            f.write(f"[{timestamp}] {message}\n")