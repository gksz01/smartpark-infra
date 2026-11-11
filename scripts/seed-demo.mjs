const base=process.env.API_URL||'http://localhost:8088';
async function call(path,method='GET',body,token=''){
 const r=await fetch(base+path,{method,headers:{'content-type':'application/json',authorization:'Bearer '+token},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(90000)});
 if(!r.ok)throw new Error(`${method} ${path}: HTTP ${r.status}`);
 return r.json();
}
if(!process.env.ADMIN_EMAIL||!process.env.ADMIN_PASSWORD)throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in your environment.');
const {token}=await call('/auth/login','POST',{email:process.env.ADMIN_EMAIL,password:process.env.ADMIN_PASSWORD});
const existing=await call('/parkings','GET',undefined,token);
for(const demo of [
 {name:'SmartPark Centro',address:'Rua Marechal Deodoro, 500 — Curitiba',description:'Estacionamento fictício para demonstração. Próximo ao centro, com acesso coberto.',capacity:20,hourlyRateCents:1200},
 {name:'SmartPark Jardim Botânico',address:'Av. Prefeito Lothário Meissner, 100 — Curitiba',description:'Estacionamento fictício para demonstração. Uma opção para passeios e compromissos na região.',capacity:12,hourlyRateCents:900},
 {name:'SmartPark Água Verde',address:'Av. República Argentina, 900 — Curitiba',description:'Estacionamento fictício para demonstração. Praticidade para a rotina do bairro.',capacity:15,hourlyRateCents:1000}
]){
 if(existing.some(p=>p.name===demo.name)){console.log('Already exists: '+demo.name);continue;}
 const {capacity,hourlyRateCents,...parking}=demo;
 const p=await call('/parkings','POST',{...parking,active:true},token);
 await call('/capacities/'+p.id,'PUT',{capacity,hourlyRateCents},token);
 console.log('Created: '+demo.name);
}
