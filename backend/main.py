from fastapi import FastAPI

app = FastAPI()

# /docs for api documentation

app.get('/')
def hello_world():
    return 'Hello World!'
