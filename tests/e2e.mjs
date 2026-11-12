import assert from 'node:assert/strict';
const base=process.env.API_URL||'http://localhost:8088';
const checks=[];const ok=(name)=>{checks.push(name);console.log('PASS '+name);};
async function call(path,{token='',method='GET',body,serviceKey}={}){const res=await fetch(base+path,{method,headers:{'content-type':'application/json',authorization:'Bearer '+token,...(serviceKey?{'x-service-key':serviceKey}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(90000)});const data=await res.json();return {status:res.status,data};}
async function expectCall(path,options,status=200){const r=await call(path,options);assert.equal(r.status,status,JSON.stringify({path,status:r.status,error:r.data?.error}));return r.data;}
const admin=(await expectCall('/auth/login',{method:'POST',body:{email:process.env.ADMIN_EMAIL,password:process.env.ADMIN_PASSWORD}},200)).token;
const seed=Date.now();
const a=await expectCall('/auth/register',{method:'POST',body:{name:'Teste motorista A',email:`a${seed}@smartpark.test`,password:'TesteSeguro123!'}},201);
const b=await expectCall('/auth/register',{method:'POST',body:{name:'Teste motorista B',email:`b${seed}@smartpark.test`,password:'TesteSeguro123!'}},201);ok('cadastro e login');
const parking=await expectCall('/parkings',{token:admin,method:'POST',body:{name:`Teste concorrência ${seed}`,address:'Rua de Teste, 100',description:'Dado criado pelo teste de integração',active:true}},201);
await expectCall('/capacities/'+parking.id,{token:admin,method:'PUT',body:{capacity:1,hourlyRateCents:1250}},200);
await expectCall('/parkings',{token:a.token,method:'POST',body:{name:'Proibido',address:'Rua teste',active:true}},403);ok('perfil motorista não administra catálogo');
const va=await expectCall('/vehicles',{token:a.token,method:'POST',body:{plate:'TST1A23',model:'Veículo de teste A'}},201);
const vb=await expectCall('/vehicles',{token:b.token,method:'POST',body:{plate:'TST2B34',model:'Veículo de teste B'}},201);
await expectCall('/vehicles/'+va.id,{token:b.token},404);ok('isolamento de veículos');
const start=new Date(Date.now()+86400000).toISOString(),end=new Date(Date.now()+86400000+3600000).toISOString();
const attempts=await Promise.all([[a,va],[b,vb]].map(([user,v])=>call('/reservations',{token:user.token,method:'POST',body:{parkingId:parking.id,vehicleId:v.id,start,end}})));
assert.deepEqual(attempts.map(r=>r.status).sort(),[201,409]);const winner=attempts.findIndex(r=>r.status===201),reservation=attempts[winner].data,user=[a,b][winner],other=[a,b][1-winner];ok('última capacidade disputada: uma confirmação e um conflito');
await expectCall('/reservations/'+reservation.id,{token:other.token},404);ok('isolamento de reservas');
await expectCall('/reservations/'+reservation.id,{token:user.token,method:'PUT',body:{start,end:new Date(Date.parse(end)+60000).toISOString()}},200);ok('alteração de período');
const declined=await expectCall('/reservations/'+reservation.id+'/payment',{token:user.token,method:'POST',body:{result:'declined'}},201);assert.equal(declined.paymentStatus,'declined');
const paid=await expectCall('/reservations/'+reservation.id+'/payment',{token:user.token,method:'POST',body:{result:'approved'}},201);assert.equal(paid.reservation.status,'paid');
await expectCall('/reservations/'+reservation.id+'/payment',{token:user.token,method:'POST',body:{result:'approved'}},201);
await expectCall('/reservations/'+reservation.id,{token:user.token,method:'PUT',body:{start,end}},409);ok('pagamento simulado e bloqueio de alteração após pagamento');
await expectCall('/reservations/'+reservation.id,{token:user.token,method:'DELETE'},200);ok('cancelamento');
if(process.env.INTERNAL_API_KEY && process.env.E2E_FORCE_DISPATCH==='true')await expectCall('/internal/outbox/dispatch',{method:'POST',serviceKey:process.env.INTERNAL_API_KEY},201);
const q=new URLSearchParams({start,end});let aggregate;
for(let i=0;i<20;i++){aggregate=await expectCall('/aggregated-data?'+q,{token:user.token},200);if(aggregate.notifications.items.filter(n=>n.reservationId===reservation.id).length===3)break;await new Promise(r=>setTimeout(r,1500));}
assert.equal(aggregate.availability.find(c=>c.parkingId===parking.id).available,1);assert.equal(aggregate.notifications.source,'azure-functions');
const notifications=aggregate.notifications.items.filter(n=>n.reservationId===reservation.id);assert.equal(notifications.length,3,'deve haver criação, pagamento e cancelamento, sem duplicar pagamento');ok('agregação dos três serviços, capacidade liberada e notificações idempotentes');
const otherAggregate=await expectCall('/aggregated-data?'+q,{token:other.token},200);assert.ok(!otherAggregate.notifications.items.some(n=>n.reservationId===reservation.id));ok('isolamento de notificações');
await expectCall('/parkings/'+parking.id,{token:admin,method:'DELETE'},200);
await expectCall('/internal/outbox/dispatch',{method:'POST'},401);await expectCall('/reservations',{},401);ok('proteção de rotas internas e autenticação');
console.log(JSON.stringify({result:'passed',checks:checks.length,base},null,2));
