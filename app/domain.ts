import { buildDailyRadar } from '../lib/radar.ts';

export const money=(n:number)=>new Intl.NumberFormat('uz-UZ').format(Math.round(n));
export const salePrice=(cost:number,markup=15)=>Math.round(cost*(100+markup)/100);
export const lineAmount=(price:number,grams:number)=>Math.round(price*grams/1000);
export const roles:Record<string,string>={buyer:'Xaridor',farmer:'Fermer',operator:'Operator',warehouse:'Ombor',quality:'Sifat nazorati',driver:'Haydovchi',accountant:'Buxgalter',admin:'Boshqaruvchi'};
export const statuses:Record<string,string>={confirmed:'Tasdiqlangan',packing:'Yig‘ilmoqda',ready:'Tayyor',transit:'Yo‘lda',delivered:'Topshirilgan',cancelled:'Bekor qilingan'};
export const catalogRows=[
 ['pomidor','Pomidor','Sabzavotlar',9300,'Pink Paradise','tomato'],['bodring','Bodring','Sabzavotlar',8000,'Orzu','cucumber'],['kartoshka','Kartoshka','Sabzavotlar',4200,'Gala','potato'],['sabzi','Sabzi','Sabzavotlar',3500,'Qizil sabzi','carrot'],['piyoz','Piyoz','Sabzavotlar',2300,'Sariq piyoz','onion'],['qalampir','Bulg‘or qalampiri','Sabzavotlar',12000,'Yashil','pepper'],['karam','Karam','Sabzavotlar',3000,'Oq karam','cabbage'],['baqlajon','Baqlajon','Sabzavotlar',7500,'Mahalliy','eggplant'],['sarimsoq','Sarimsoq','Sabzavotlar',22000,'Mahalliy','garlic'],['lavlagi','Lavlagi','Sabzavotlar',4000,'Qizil','beet'],
 ['olma','Olma','Mevalar',9000,'Golden','apple'],['anor','Anor','Mevalar',14000,'Quva','pomegranate'],['uzum','Uzum','Mevalar',16000,'Husayni','grapes'],['nok','Nok','Mevalar',13000,'Mahalliy','pear'],['limon','Limon','Mevalar',22000,'Mahalliy','lemon'],['behi','Behi','Mevalar',10000,'Mahalliy','quince'],['xurmo','Xurmo','Mevalar',11000,'Korolyok','persimmon'],['shaftoli','Shaftoli','Mevalar',15000,'Mavsumiy','peach'],['orik','O‘rik','Mevalar',14000,'Mavsumiy','apricot'],['olxori','Olxo‘ri','Mevalar',10000,'Mahalliy','plum'],
 ['kashnich','Kashnich','Ko‘katlar',18000,'Yangi uzilgan','herbs'],['ukrop','Ukrop','Ko‘katlar',18000,'Yangi uzilgan','herbs'],['petrushka','Petrushka','Ko‘katlar',17000,'Yangi uzilgan','herbs'],['ismaloq','Ismaloq','Ko‘katlar',12000,'Mahalliy','leaves'],['kokpiyoz','Ko‘k piyoz','Ko‘katlar',14000,'Mahalliy','scallion'],
 ['qovoq','Qovoq','Mavsumiy',3500,'Muskat','pumpkin'],['qovun','Qovun','Mavsumiy',6000,'Obinovvot','melon'],['tarvuz','Tarvuz','Mavsumiy',3000,'Mahalliy','watermelon'],['turp','Turp','Mavsumiy',3500,'Yashil','radish'],['sholgom','Sholg‘om','Mavsumiy',4000,'Mahalliy','turnip']
];
export type State=any;
const id=(prefix:string)=>prefix+'-'+crypto.randomUUID().slice(0,8);
const now=()=>new Date().toISOString();
const date=()=>new Date().toISOString().slice(0,10);
export function seed():State {
 const products=catalogRows.map((r,i)=>({id:r[0],name:r[1],category:r[2],cost:r[3],variety:r[4],art:r[5],markup:15,unit:'kg',minGrams:1000,farmer:'F-'+String(i%10+1).padStart(3,'0'),origin:i%2?'Oltiariq':'Farg‘ona',grade:'I nav',enabled:!['shaftoli','orik','tarvuz','qovun'].includes(String(r[0]))}));
 const lots=products.filter((p:any)=>p.enabled).map((p:any,i:number)=>({id:'LOT-'+(i+1),productId:p.id,farmerId:p.farmer,grams:(i%4+2)*100000,reserved:0,cost:p.cost,zone:p.category==='Ko‘katlar'?'Sovuq zona B':'Sovuq zona A',expires:new Date(Date.now()+4*86400000).toISOString().slice(0,10),createdAt:now(),quality:'Qabul qilingan'}));
 return {products,lots,commitments:[],orders:[],ledger:[],expenses:[],claims:[],subscriptions:[],applications:[],recommendations:[],audit:[],closedPeriods:[],keys:[],farmers:Array.from({length:10},(_,i)=>({id:'F-'+String(i+1).padStart(3,'0'),name:'Namuna xo‘jalik '+(i+1),region:i%2?'Oltiariq':'Farg‘ona'})),buyers:Array.from({length:20},(_,i)=>({id:'B-'+(i+1),name:'Namuna oshxona '+(i+1)})),vehicles:[{id:'V-01',name:'Sovutgichli transport 01',capacity:2500000},{id:'V-02',name:'Sovutgichli transport 02',capacity:2500000}],settings:{markup:15,rent:12000000,utilities:3000000,payroll:25000000,other:4000000,routeCost:500000,packPerKg:150,loss:2,workDays:26,capacity:150000,minOrder:100000,buyerLimit:0,paymentDays:0,hub:'Oltiariq tumani',hubAddress:'Aniq manzil kiritilmagan',cutoff:'18:00',zones:['Farg‘ona shahri','Oltiariq tumani'],light:false},profile:{company:'Namuna oshxona',phone:'',address:'',zone:'Farg‘ona shahri',person:''}};
}
export function stock(s:State,pid:string){return s.lots.filter((l:any)=>l.productId===pid).reduce((n:number,l:any)=>n+l.grams-l.reserved,0)}
export function promised(s:State,pid:string){return s.commitments.filter((c:any)=>c.productId===pid&&c.status==='approved').reduce((n:number,c:any)=>n+c.grams-c.reserved,0)}
export function totals(o:any){return o.lines.reduce((n:number,l:any)=>n+lineAmount(l.price,l.grams),0)}
export function paid(s:State,oid:string){return s.ledger.filter((e:any)=>e.orderId===oid&&e.kind==='payment').reduce((n:number,e:any)=>n+e.amount,0)}
export function returned(s:State,oid:string){return -s.ledger.filter((e:any)=>e.orderId===oid&&e.kind==='sale_return').reduce((n:number,e:any)=>n+e.amount,0)}
export function stats(s:State){const sum=(k:string)=>s.ledger.filter((e:any)=>e.kind===k).reduce((n:number,e:any)=>n+e.amount,0);const revenue=sum('sale')+sum('sale_return'),cogs=sum('cogs')+sum('cogs_return'),expenses=s.expenses.reduce((n:number,e:any)=>n+e.amount,0);return {revenue,cogs,expenses,gross:revenue-cogs,profit:revenue-cogs-expenses,receivable:s.orders.filter((o:any)=>o.status!=='cancelled').reduce((n:number,o:any)=>n+Math.max(0,totals(o)-returned(s,o.id)-paid(s,o.id)),0),payable:sum('purchase')-sum('farmer_payment'),cash:sum('payment')-sum('refund')-sum('farmer_payment')-expenses,inventory:s.lots.reduce((n:number,l:any)=>n+lineAmount(l.cost,l.grams),0)}}
const permissions:Record<string,string[]>={
 checkout:['buyer'],cancel:['buyer','operator'],profile:['buyer'],subscription:['buyer'],claim:['buyer'],offer:['farmer'],approve:['operator'],receive:['warehouse','quality'],advance:['operator','warehouse','driver'],payment:['accountant'],expense:['accountant','operator'],settle:['accountant'],return:['operator','accountant'],  close:['accountant'],settings:['admin'],prices:['admin'],application:['buyer','farmer'],assign:['operator'],radarRefresh:['operator'],radarResolve:['operator'],light:['buyer','farmer','operator','warehouse','driver','accountant','quality']};
function fail(message:string):never{throw new Error(message)}
function integer(v:any,min=0,max=1e12){if(!Number.isSafeInteger(v)||v<min||v>max)fail('Miqdor yoki summa noto‘g‘ri.');return v}
function text(v:any,max=500){if(typeof v!=='string'||!v.trim()||v.length>max)fail('Majburiy maydonni to‘ldiring.');return v.trim()}
function post(s:State,kind:string,amount:number,ref:any={}){if(s.closedPeriods.includes(date().slice(0,7)))fail('Bu oy yopilgan. Keyingi ochiq davrda tuzatish kiriting.');s.ledger.push({id:id('L'),kind,amount,at:now(),...ref})}
export function transition(input:State,action:string,p:any,role:string,key:string):State{
 if(!roles[role])fail('Rol noto‘g‘ri.');if(role!=='admin'&&!permissions[action]?.includes(role))fail('Bu amal ushbu rol uchun ruxsat etilmagan.');
 if(typeof key!=='string'||key.length<8||key.length>100)fail('So‘rov kaliti noto‘g‘ri.');
 if(input.keys.includes(key))return input;
 const s=structuredClone(input);let subject='';
 if(action==='checkout'){
  if(!Array.isArray(p.items)||!p.items.length||p.items.length>50)fail('Savat bo‘sh.');
  const unique=new Set(p.items.map((x:any)=>x.id));if(unique.size!==p.items.length)fail('Mahsulot ikki marta kiritilgan.');
  if(!s.settings.zones.includes(p.zone))fail('Bu hududda yetkazish hali yoqilmagan.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(p.deliveryDate)||p.deliveryDate<date())fail('Yetkazish sanasini tekshiring.');
  const order={id:id('H'),at:now(),status:'confirmed',company:text(p.company,100),address:text(p.address,300),phone:text(p.phone,30),zone:p.zone,deliveryDate:p.deliveryDate,window:p.window==='14:00–18:00'?p.window:'08:00–12:00',note:String(p.note??'').slice(0,500),vehicle:'',proof:'',costComplete:false,lines:[] as any[]};
  for(const item of p.items){const pr=s.products.find((x:any)=>x.id===item.id&&x.enabled);if(!pr)fail('Mahsulot topilmadi.');const grams=integer(item.grams,pr.minGrams,10000000);if(stock(s,pr.id)+promised(s,pr.id)<grams)fail(pr.name+': mavjud miqdor yetarli emas.');
   let remain=grams;const allocations:any[]=[];for(const l of s.lots.filter((x:any)=>x.productId===pr.id).sort((a:any,b:any)=>a.expires.localeCompare(b.expires))){if(!remain)break;const take=Math.min(remain,l.grams-l.reserved);if(take>0){l.reserved+=take;allocations.push({type:'lot',id:l.id,grams:take,cost:l.cost});remain-=take;}}
   for(const c of s.commitments.filter((x:any)=>x.productId===pr.id&&x.status==='approved')){if(!remain)break;const take=Math.min(remain,c.grams-c.reserved);if(take>0){c.reserved+=take;allocations.push({type:'commitment',id:c.id,grams:take,cost:c.cost});remain-=take;}}
   order.lines.push({productId:pr.id,name:pr.name,price:salePrice(pr.cost,pr.markup),grams,returned:0,allocations});
  }
  if(totals(order)<s.settings.minOrder)fail('Minimal buyurtma: '+money(s.settings.minOrder)+' so‘m.');
  if(s.orders.some((o:any)=>o.status==='delivered'&&paid(s,o.id)<totals(o)-returned(s,o.id)&&Date.now()-Date.parse(o.deliveredAt)>s.settings.paymentDays*86400000))fail('Muddati o‘tgan qarz bor. Avval to‘lovni yakunlang.');
  s.orders.unshift(order);subject=order.id;
 }else if(action==='cancel'){
  const o=s.orders.find((o:any)=>o.id===p.id);if(!o||!['confirmed','packing','ready'].includes(o.status))fail('Bu buyurtmani bekor qilib bo‘lmaydi.');
  for(const l of o.lines)for(const a of l.allocations){if(a.type==='shortage')continue;const target=(a.type==='lot'?s.lots:s.commitments).find((x:any)=>x.id===a.id);if(target)target.reserved-=a.grams;}
  o.status='cancelled';o.reason=text(p.reason);subject=o.id;
 }else if(action==='profile'){
  s.profile={company:text(p.company,100),phone:String(p.phone??'').slice(0,30),address:String(p.address??'').slice(0,300),zone:s.settings.zones.includes(p.zone)?p.zone:s.settings.zones[0],person:String(p.person??'').slice(0,100)};
 }else if(action==='offer'){
  const pr=s.products.find((x:any)=>x.id===p.productId);if(!pr)fail('Mahsulotni tanlang.');
  s.commitments.unshift({id:id('S'),productId:pr.id,farmerId:'F-001',grams:integer(p.grams,1000,100000000),reserved:0,cost:integer(p.cost,1,10000000),readyDate:text(p.readyDate,10),status:'pending',at:now(),note:String(p.note??'').slice(0,500)});
 }else if(action==='approve'){
  const c=s.commitments.find((x:any)=>x.id===p.id);if(!c||c.status!=='pending')fail('Taklif topilmadi.');c.status=p.reject?'rejected':'approved';subject=c.id;
 }else if(action==='receive'){
  const c=s.commitments.find((x:any)=>x.id===p.id);if(!c||c.status!=='approved')fail('Tasdiqlangan taklifni tanlang.');const grams=integer(p.grams,0,c.grams);const reason=grams<c.grams?text(p.reason):'';
  const lot={id:id('LOT'),productId:c.productId,farmerId:c.farmerId,grams,reserved:0,cost:c.cost,zone:p.zone==='Quruq zona'?'Quruq zona':'Sovuq zona A',expires:text(p.expires,10),createdAt:now(),quality:'Qabul qilingan',reason};let available=grams;
  for(const o of s.orders){if(o.status==='cancelled')continue;for(const line of o.lines){const next:any[]=[];for(const a of line.allocations){if(a.type!=='commitment'||a.id!==c.id){next.push(a);continue;}const take=Math.min(available,a.grams);if(take>0){next.push({type:'lot',id:lot.id,grams:take,cost:lot.cost});lot.reserved+=take;available-=take;}if(take<a.grams){next.push({type:'shortage',id:c.id,grams:a.grams-take,cost:c.cost});o.shortage=true;}}line.allocations=next;}}
  c.status='received';c.accepted=grams;c.rejected=c.grams-grams;c.reserved=0;s.lots.push(lot);post(s,'purchase',lineAmount(c.cost,grams),{farmerId:c.farmerId,ref:lot.id});subject=c.id;
 }else if(action==='advance'){
  const o=s.orders.find((x:any)=>x.id===p.id);if(!o)fail('Buyurtma topilmadi.');const path=['confirmed','packing','ready','transit','delivered'];const index=path.indexOf(o.status);if(index<0||index===4)fail('Holatni o‘zgartirib bo‘lmaydi.');
  const allowed:Record<string,string[]>={confirmed:['operator','warehouse'],packing:['warehouse'],ready:['operator','driver'],transit:['driver']};if(role!=='admin'&&!allowed[o.status].includes(role))fail('Bu bosqich boshqa xodim vakolatida.');
  if(o.lines.some((l:any)=>l.allocations.some((a:any)=>a.type!=='lot')))fail('Mahsulot hali to‘liq qabul qilinmagan. Taqchillikni hal qiling.');
  if(o.status==='ready'&&paid(s,o.id)+s.settings.buyerLimit<totals(o))fail('Yetkazishga chiqarishdan oldin to‘lov kerak.');
  if(o.status==='ready'&&!o.vehicle)fail('Avval transport biriktiring.');
  if(o.status==='transit'){o.proof=text(p.proof,200);o.deliveredAt=now();let cogs=0;for(const l of o.lines)for(const a of l.allocations){const lot=s.lots.find((x:any)=>x.id===a.id);if(!lot||lot.grams<a.grams||lot.reserved<a.grams)fail('Ombor qoldig‘i mos kelmadi.');lot.grams-=a.grams;lot.reserved-=a.grams;cogs+=lineAmount(a.cost,a.grams);}post(s,'sale',totals(o),{orderId:o.id});post(s,'cogs',cogs,{orderId:o.id});}
  o.status=path[index+1];subject=o.id;
 }else if(action==='assign'){
  const o=s.orders.find((x:any)=>x.id===p.id);const vehicle=s.vehicles.find((x:any)=>x.id===p.vehicle);if(!o||!vehicle||['cancelled','delivered'].includes(o.status))fail('Reys ma’lumotini tekshiring.');
  const load=s.orders.filter((x:any)=>x.id!==o.id&&x.vehicle===vehicle.id&&x.deliveryDate===o.deliveryDate&&!['cancelled','delivered'].includes(x.status)).reduce((n:number,x:any)=>n+x.lines.reduce((z:number,l:any)=>z+l.grams,0),0)+o.lines.reduce((n:number,l:any)=>n+l.grams,0);if(load>vehicle.capacity)fail('Mashina sig‘imi yetarli emas.');o.vehicle=vehicle.id;subject=o.id;
 }else if(action==='payment'){
  const o=s.orders.find((x:any)=>x.id===p.id);if(!o||o.status==='cancelled')fail('Buyurtma topilmadi.');const amount=integer(p.amount,1,totals(o)-returned(s,o.id)-paid(s,o.id));const ref=text(p.reference,100);if(s.ledger.some((x:any)=>x.kind==='payment'&&x.reference===ref))fail('Bu bank to‘lovi avval yozilgan.');post(s,'payment',amount,{orderId:o.id,reference:ref});subject=o.id;
 }else if(action==='expense'){
  if(s.closedPeriods.includes(date().slice(0,7)))fail('Oy yopilgan.');const category=text(p.category,100);if(!['Transport','Qadoqlash','Ijara','Ish haqi','Kommunal','Yo‘qotish','Boshqa'].includes(category))fail('Xarajat turi noto‘g‘ri.');
  const exp={id:id('E'),category,amount:integer(p.amount,1),note:text(p.note),orderId:p.orderId||null,at:now()};if(exp.orderId&&!s.orders.some((o:any)=>o.id===exp.orderId))fail('Buyurtma topilmadi.');s.expenses.push(exp);if(p.complete&&exp.orderId)s.orders.find((o:any)=>o.id===exp.orderId).costComplete=true;subject=exp.id;
 }else if(action==='settle'){
  const farmer=text(p.farmerId,30);const due=s.ledger.filter((e:any)=>e.farmerId===farmer).reduce((n:number,e:any)=>n+(e.kind==='purchase'?e.amount:e.kind==='farmer_payment'?-e.amount:0),0);const ref=text(p.reference,100);if(s.ledger.some((e:any)=>e.kind==='farmer_payment'&&e.reference===ref))fail('To‘lov raqami takrorlangan.');post(s,'farmer_payment',integer(p.amount,1,due),{farmerId:farmer,reference:ref});subject=farmer;
 }else if(action==='claim'){
  const o=s.orders.find((x:any)=>x.id===p.orderId&&x.status==='delivered');if(!o)fail('Topshirilgan buyurtmani tanlang.');const l=o.lines.find((x:any)=>x.productId===p.productId);if(!l)fail('Mahsulot topilmadi.');s.claims.push({id:id('C'),orderId:o.id,productId:l.productId,grams:integer(p.grams,1,l.grams-l.returned),reason:text(p.reason),status:'open',at:now()});subject=o.id;
 }else if(action==='return'){
  const claim=s.claims.find((x:any)=>x.id===p.id&&x.status==='open');if(!claim)fail('Ochiq murojaatni tanlang.');if(p.reject){claim.status='rejected';claim.resolution=text(p.reason);}else{const o=s.orders.find((x:any)=>x.id===claim.orderId),l=o.lines.find((x:any)=>x.productId===claim.productId);if(claim.grams>l.grams-l.returned)fail('Qaytariladigan miqdor oshib ketgan.');l.returned+=claim.grams;post(s,'sale_return',-lineAmount(l.price,claim.grams),{orderId:o.id,ref:claim.id});claim.status='credited';claim.resolution='Xaridor balansiga qaytarildi; mahsulot karantinda';/* Damaged product has no recoverable inventory; original COGS remains. */}subject=claim.id;
 }else if(action==='subscription'){
  if(p.id){const x=s.subscriptions.find((x:any)=>x.id===p.id);if(!x)fail('Ro‘yxat topilmadi.');x.active=!x.active;}else{if(!Array.isArray(p.items)||!p.items.length)fail('Avval savatga mahsulot qo‘shing.');s.subscriptions.push({id:id('R'),name:text(p.name,100),day:text(p.day,30),items:p.items.map((x:any)=>({id:text(x.id,50),grams:integer(x.grams,1000,10000000)})),active:true,at:now()});}
 }else if(action==='close'){
  const period=date().slice(0,7);if(s.closedPeriods.includes(period))fail('Oy allaqachon yopilgan.');s.closedPeriods.push(period);subject=period;
 }else if(action==='prices'){
  const pr=s.products.find((x:any)=>x.id===p.id);if(!pr)fail('Mahsulot topilmadi.');pr.cost=integer(p.cost,1,10000000);pr.markup=integer(p.markup,0,100);subject=pr.id;
 }else if(action==='settings'){
  for(const field of ['rent','utilities','payroll','other','routeCost','packPerKg','capacity','minOrder','buyerLimit','paymentDays'])if(p[field]!==undefined)s.settings[field]=integer(p[field],0,1e10);
  if(p.hubAddress!==undefined)s.settings.hubAddress=text(p.hubAddress,300);
 }else if(action==='application'){
  s.applications.push({id:id('A'),type:p.type==='farmer'?'farmer':'buyer',name:text(p.name,100),phone:text(p.phone,30),region:text(p.region,100),note:String(p.note??'').slice(0,500),at:now(),status:'pending'});
 }else if(action==='radarRefresh'){
  s.recommendations=buildDailyRadar(s.products,s.lots,s.orders, new Date()).map((recommendation)=>({
    ...recommendation,
    status: p.keepResolved && s.recommendations?.find((item:any)=>item.id===recommendation.id)?.status==='approved'
      ? 'approved'
      : recommendation.status,
  }));
  subject='Hosil Radar';
 }else if(action==='radarResolve'){
  const recommendation=s.recommendations?.find((item:any)=>item.id===p.id);
  if(!recommendation||recommendation.status!== 'pending')fail('Tavsiya topilmadi yoki allaqachon ko‘rib chiqilgan.');
  if(!['approved','rejected'].includes(p.decision))fail('Tavsiya qarori noto‘g‘ri.');
  recommendation.status=p.decision;
  recommendation.resolvedAt=now();
  recommendation.resolution=text(p.note||'Operator tasdiqladi',500);
  subject=recommendation.id;
 }else if(action==='light'){s.settings.light=!!p.value;
 }else fail('Noma’lum amal.');
 s.audit.unshift({id:id('A'),at:now(),role,action,subject});s.keys.push(key);
 if(s.lots.some((x:any)=>x.grams<0||x.reserved<0||x.reserved>x.grams))fail('Ombor qoldig‘i tekshiruvidan o‘tmadi.');return s;
}
