const {createWebServer}=require('./web-host.cjs');
const server=createWebServer();
server.listen(Number(process.env.PORT??4174),process.env.HOST??'0.0.0.0',()=>console.log(`Asystent Remontu web: port ${server.address().port}`));
