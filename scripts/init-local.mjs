import {randomBytes} from 'node:crypto';
import {writeFileSync,existsSync} from 'node:fs';
if(existsSync('.env'))throw new Error('.env já existe; nenhuma configuração foi alterada.');
const key=randomBytes(32).toString('base64');
const config={JWT_SECRET:randomBytes(48).toString('hex'),INTERNAL_API_KEY:randomBytes(48).toString('hex'),SQL_PASSWORD:'Sp!'+randomBytes(20).toString('hex'),ADMIN_EMAIL:'admin@smartpark.test',ADMIN_PASSWORD:'Sp!'+randomBytes(12).toString('hex'),AZURITE_ACCOUNTS:'smartpark:'+key,LOCAL_STORAGE_CONNECTION_STRING:`DefaultEndpointsProtocol=http;AccountName=smartpark;AccountKey=${key};BlobEndpoint=http://azurite:10000/smartpark;QueueEndpoint=http://azurite:10001/smartpark;TableEndpoint=http://azurite:10002/smartpark;`};
writeFileSync('.env',Object.entries(config).map(([k,v])=>`${k}=${v}`).join('\n')+'\n',{mode:0o600});
console.log('.env criado. Consulte ADMIN_EMAIL e ADMIN_PASSWORD localmente. Não publique este arquivo.');
