import test from 'node:test';
import assert from 'node:assert/strict';
import {seed,transition,salePrice,stock,totals,paid,stats,returned} from '../app/domain.ts';
import {buildDailyRadar,calculateDemandForecast} from '../lib/radar.ts';
const tomorrow=new Date(Date.now()+86400000).toISOString().slice(0,10);
const payload=(grams=10000)=>({company:'Test oshxona',phone:'+998901234567',address:'Farg‘ona test ko‘chasi',zone:'Farg‘ona shahri',deliveryDate:tomorrow,items:[{id:'pomidor',grams}]});
const run=(s,action,p={},role='admin',key=crypto.randomUUID())=>transition(s,action,p,role,key);
test('15% markup is 10,695, not 15% margin',()=>assert.equal(salePrice(9300),10695));
test('reservation is atomic, idempotent, cancellable; price snapshot survives edits',()=>{const input=seed(),before=stock(input,'pomidor'),key=crypto.randomUUID();let s=run(input,'checkout',payload(),'buyer',key);assert.equal(stock(input,'pomidor'),before);assert.equal(stock(s,'pomidor'),before-10000);assert.equal(totals(s.orders[0]),106950);assert.deepEqual(run(s,'checkout',payload(),'buyer',key),s);s=run(s,'prices',{id:'pomidor',cost:10000,markup:15});assert.equal(totals(s.orders[0]),106950);s=run(s,'cancel',{id:s.orders[0].id,reason:'Test'});assert.equal(stock(s,'pomidor'),before);});
test('overbooking and unauthorized financial writes fail',()=>{const s=seed();assert.throws(()=>run(s,'checkout',payload(9999999),'buyer'),/yetarli/);assert.throws(()=>run(s,'expense',{category:'Ijara',amount:1,note:'Test'},'buyer'),/ruxsat/);assert.equal(s.orders.length,0)});
test('dispatch requires payment and vehicle; delivery books revenue and COGS once',()=>{let s=run(seed(),'checkout',payload(),'buyer');const oid=s.orders[0].id;s=run(s,'advance',{id:oid});s=run(s,'advance',{id:oid});assert.throws(()=>run(s,'advance',{id:oid}),/to‘lov/);s=run(s,'payment',{id:oid,amount:106950,reference:'bank-1'});assert.equal(paid(s,oid),106950);assert.throws(()=>run(s,'payment',{id:oid,amount:1,reference:'bank-2'}));assert.throws(()=>run(s,'advance',{id:oid}),/transport/);s=run(s,'assign',{id:oid,vehicle:'V-01'});s=run(s,'advance',{id:oid});assert.equal(stats(s).revenue,0);s=run(s,'advance',{id:oid,proof:'Qabul qiluvchi test'});assert.equal(stats(s).revenue,106950);assert.equal(stats(s).cogs,93000);assert.equal(stats(s).gross,13950);assert.throws(()=>run(s,'advance',{id:oid,proof:'Again'}));s=run(s,'claim',{orderId:oid,productId:'pomidor',grams:1000,reason:'Shikastlangan'});s=run(s,'return',{id:s.claims[0].id});assert.equal(returned(s,oid),10695);assert.equal(stats(s).cogs,93000);assert.equal(stats(s).revenue,96255);});
test('supply shortfall converts reserved promise into blocked order without negative stock',()=>{let s=seed();s.lots=[];s=run(s,'offer',{productId:'pomidor',grams:15000,cost:9300,readyDate:tomorrow},'farmer');const cid=s.commitments[0].id;s=run(s,'approve',{id:cid});s=run(s,'checkout',payload(),'buyer');s=run(s,'receive',{id:cid,grams:7000,reason:'3 kg shikastlangan',expires:tomorrow,zone:'Sovuq zona A'});assert.equal(s.orders[0].shortage,true);assert.equal(s.lots[0].reserved,7000);assert.equal(stats(s).payable,65100);assert.throws(()=>run(s,'advance',{id:s.orders[0].id}),/Taqchillik/);s=run(s,'cancel',{id:s.orders[0].id,reason:'Kam keldi'});assert.equal(s.lots[0].reserved,0);assert.equal(stock(s,'pomidor'),7000)});
test('closed period rejects financial writes atomically',()=>{let s=run(seed(),'checkout',payload());s=run(s,'close');assert.throws(()=>run(s,'payment',{id:s.orders[0].id,amount:106950,reference:'bank'}),/yopilgan/);assert.equal(s.ledger.length,0);assert.throws(()=>run(s,'expense',{category:'Ijara',amount:100,note:'Rent'}),/yopilgan/)});

test('radar forecast is deterministic and recommendations require operator approval',()=>{
 const s=seed();
 const now=new Date('2026-11-04T00:00:00Z');
 const recommendations=buildDailyRadar(s.products.slice(0,1),[{id:'L-1',productId:'pomidor',grams:1000,reserved:0,expires:'2026-11-05'}],[{at:'2026-11-03T10:00:00Z',status:'confirmed',lines:[{productId:'pomidor',grams:10000}]}],now);
 assert.ok(recommendations.length);
 assert.equal(recommendations.every((item)=>item.status==='pending'),true);
 const forecast=calculateDemandForecast([], 'pomidor', now);
 assert.equal(forecast,0);
});
