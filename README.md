# HonoType 

## What is that ? Why ? What for ?
Yet another NodeJS boilerplate ? - Yup!

Express.js died a brave death, NestJS is a good, cool framework. But sometimes the complexity of NestJS makes me too lazy to keep doing my own projects. So I decided to make something more convenient for my smaller projects. With all the modern conveniences of TypeScript and build systems.

## Endpoints:

### /auth
| Path               | Method | Description       |
|--------------------|--------|-------------------|
| /auth/login        | POST   | LoginAction       |
| /auth/login/google | GET    | LoginGoogleAction |
| /auth/register     | POST   | RegisterAction    |
