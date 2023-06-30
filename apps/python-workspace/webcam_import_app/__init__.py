from fastapi import FastAPI

app = FastAPI()

# keep this import here
from . import main
