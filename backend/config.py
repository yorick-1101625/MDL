from pathlib import Path

from dotenv import load_dotenv
from os import getenv

load_dotenv(dotenv_path=Path(__file__).parent / ".env")
DOWNLOAD_PATH = getenv('DOWNLOAD_PATH')

# Set default
DOWNLOAD_PATH = Path(DOWNLOAD_PATH) if DOWNLOAD_PATH else Path(__file__).parent / "downloads"
# Create folder
DOWNLOAD_PATH.mkdir(parents=True, exist_ok=True)
