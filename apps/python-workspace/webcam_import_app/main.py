from . import app


@app.get('/')
async def root():
    return {'message': 'Hey, It is me Goku'}
