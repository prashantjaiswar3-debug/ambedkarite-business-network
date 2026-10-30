import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

// Public browser credentials only. Never put a service_role/secret key in this file.
const SUPABASE_URL = "https://ztwownezpjrbeowwhaxw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ZIkPhkCRyOlRG-Gci9s_lg_DnBoAXh0";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
let session = null, profile = null, effectiveAccountType = "consumer", allBusinesses = [], categories = [], categoryFilter = "", statusFilter = "all", authMode = "login", lang = localStorage.getItem("abn-language") || "en";
const translations = {
  en: {
    dashboard:"Dashboard",businesses:"Businesses",products:"Products & Services",enquiries:"Enquiries",myListings:"My Listings",verification:"Business Verification",profile:"My Profile",
    heroTitle:'Together We Build a <em>Stronger Business Community</em>',heroSub:"Support. Grow. Succeed.",heroText:"Connect with trusted businesses, products and services from our community.",
    all:"All",businessListings:"Business Listings",businessIntro:"Find and connect with verified and trusted businesses in our community.",
    allBusinesses:"All Businesses",verifiedOnly:"Verified Only",notVerified:"Not Verified",productsServices:"Products & Services",productsIntro:"Explore offerings from community businesses.",
    ownerIntro:"Manage your business presence on ABN.",addBusiness:"Add Business",loginOwner:"Login as a business owner to manage your listings and enquiries.",
    enquiryIntro:"Customer enquiries for your businesses.",verificationIntro:"Build customer confidence with an ABN verified badge.",
    getVerified:"Get Verified on ABN",verifyText:"Submit your business documents for review by the ABN team.",
    applyVerification:"Apply for Verification",verifyOneClick:"Get Verified<br>in One Click",verifyDesc:"Show your business is genuine and build trust with more customers.",
    quickProcess:"Quick & easy verification process",confidence:"Build customer confidence",verifiedBadge:"Get the verified badge",visibility:"More visibility in search & listings",
    verifyNow:"Verify Your Business Now →",supportLocal:"Support Local<br>Businesses",supportCommunity:"Support Our Community"
  },
  hi: {
    dashboard:"डैशबोर्ड",businesses:"व्यवसाय",products:"उत्पाद और सेवाएँ",enquiries:"पूछताछ",myListings:"मेरी लिस्टिंग",verification:"व्यवसाय सत्यापन",profile:"मेरी प्रोफ़ाइल",
    heroTitle:'आइए मिलकर बनाएँ <em>मज़बूत व्यवसाय समुदाय</em>',heroSub:"सहयोग करें। आगे बढ़ें। सफल बनें।",heroText:"हमारे समुदाय के भरोसेमंद व्यवसायों, उत्पादों और सेवाओं से जुड़ें।",
    all:"सभी",businessListings:"व्यवसाय सूची",businessIntro:"हमारे समुदाय के सत्यापित और भरोसेमंद व्यवसायों से जुड़ें।",
    allBusinesses:"सभी व्यवसाय",verifiedOnly:"केवल सत्यापित",notVerified:"असत्यापित",productsServices:"उत्पाद और सेवाएँ",productsIntro:"समुदाय के व्यवसायों के उत्पाद और सेवाएँ देखें।",
    ownerIntro:"ABN पर अपने व्यवसाय की जानकारी प्रबंधित करें।",addBusiness:"व्यवसाय जोड़ें",loginOwner:"अपनी लिस्टिंग और पूछताछ प्रबंधित करने के लिए व्यवसाय मालिक के रूप में लॉगिन करें।",
    enquiryIntro:"आपके व्यवसाय के लिए ग्राहक पूछताछ।",verificationIntro:"ABN सत्यापित बैज से ग्राहकों का भरोसा बढ़ाएँ।",
    getVerified:"ABN पर सत्यापित हों",verifyText:"ABN टीम द्वारा समीक्षा के लिए व्यवसाय दस्तावेज़ जमा करें।",
    applyVerification:"सत्यापन के लिए आवेदन करें",verifyOneClick:"एक क्लिक में<br>सत्यापन पाएँ",verifyDesc:"अपने व्यवसाय की प्रामाणिकता दिखाएँ और ग्राहकों का भरोसा जीतें।",
    quickProcess:"आसान सत्यापन प्रक्रिया",confidence:"ग्राहकों का भरोसा बढ़ाएँ",verifiedBadge:"सत्यापित बैज पाएँ",visibility:"खोज और लिस्टिंग में अधिक दृश्यता",
    verifyNow:"अभी व्यवसाय सत्यापित करें →",supportLocal:"स्थानीय व्यवसायों<br>का समर्थन करें",supportCommunity:"अपने समुदाय का साथ दें"
  }
};
function applyLanguage(){
  document.documentElement.lang=lang;
  $$("[data-i18n]").forEach(el=>{const key=el.dataset.i18n;if(translations[lang][key])el.innerHTML=translations[lang][key]});
  $("#langToggle").textContent=lang==="en"?"हिंदी":"English";
  localStorage.setItem("abn-language",lang);
}
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2600)}
function slugify(s){return s.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")+"-"+Math.random().toString(36).slice(2,7)}
async function uploadUserFile(file,bucket,folder,maxMB=5){
  if(!file)return null;
  if(!session?.user?.id)throw new Error("Please sign in before uploading.");
  if(file.size>maxMB*1024*1024)throw new Error(`File must be smaller than ${maxMB} MB.`);
  const allowed=["image/jpeg","image/png","image/webp","application/pdf"];
  if(!allowed.includes(file.type))throw new Error("Use JPG, PNG, WEBP or PDF files only.");
  const ext=(file.name.split(".").pop()||"bin").toLowerCase().replace(/[^a-z0-9]/g,"");
  const path=`${session.user.id}/${folder}/${crypto.randomUUID()}.${ext}`;
  const {error}=await supabase.storage.from(bucket).upload(path,file,{cacheControl:"3600",upsert:false,contentType:file.type});
  if(error)throw error;
  if(bucket==="abn-verification-docs")return path;
  const {data}=supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

let indiaDistricts=[];
async function loadIndiaDistricts(){if(indiaDistricts.length)return;try{const response=await fetch(new URL("./assets/india-districts.json?v=20261030",import.meta.url),{cache:"no-store"});if(!response.ok)throw new Error("District data unavailable");indiaDistricts=await response.json()}catch(error){console.warn("ABN district dataset:",error);toast("District list could not load. Please refresh and try again.")}}
function setupIndiaLocation(stateId,districtId,stateValue="",districtValue=""){const state=$("#"+stateId),district=$("#"+districtId);if(!state||!district)return;const states=indiaDistricts.map(x=>x.name);state.innerHTML='<option value="">Select state / UT</option>'+states.map(name=>'<option value="'+escapeHtml(name)+'">'+escapeHtml(name)+'</option>').join("");state.value=states.includes(stateValue)?stateValue:"";const fill=()=>{const selected=indiaDistricts.find(x=>x.name===state.value);const list=selected?.districts||[];district.innerHTML='<option value="">Select district</option>'+list.map(name=>'<option value="'+escapeHtml(name)+'">'+escapeHtml(name+(selected?.aliases?.[name]?.length?' (Maunath Bhanjan)':''))+'</option>').join("");district.disabled=!state.value;district.value=list.includes(districtValue)?districtValue:""};state.onchange=()=>{fill();district.value=""};fill();}

let businessMap=null,businessMarker=null;
async function reverseGeocodeBusiness(lat,lng){
 try{
  const response=await fetch("https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat="+encodeURIComponent(lat)+"&lon="+encodeURIComponent(lng));
  if(!response.ok)throw new Error("Lookup failed");
  const result=await response.json(),a=result.address||{};
  const street=[a.house_number,a.road||a.pedestrian||a.footway].filter(Boolean).join(" ");
  if(street)$("#bizAddress").value=street;
  const locality=a.suburb||a.neighbourhood||a.residential||a.hamlet;
  if(locality)$("#bizAddress2").value=locality;
  const state=a.state||"";
  if(state&&Array.from($("#bizState").options).some(o=>o.value===state))$("#bizState").value=state;
  const detectedDistrict=a.state_district||a.county||a.district||"";
  await loadIndiaDistricts();
  setupIndiaLocation("bizState","bizDistrict",$("#bizState").value,detectedDistrict);
  $("#bizPincode").value=a.postcode||$("#bizPincode").value;
 }catch(error){toast("Map located, but address details were not available. Please fill them manually.");}
}
async function locateBusinessAddress(){
 const query=[$("#bizAddress").value,$("#bizAddress2").value,$("#bizDistrict").value,$("#bizState").value,$("#bizPincode").value,"India"].filter(Boolean).join(", ");
 if(!$("#bizAddress").value.trim())return toast("Enter the street/building address first.");
 try{const response=await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q="+encodeURIComponent(query));const results=await response.json();if(!results.length)return toast("Address not found. Add an area or landmark and try again.");const p=results[0];setBusinessCoordinates(+p.lat,+p.lon);businessMap.setView([+p.lat,+p.lon],16);await reverseGeocodeBusiness(+p.lat,+p.lon);}catch(error){toast("Could not locate this address right now.");}
}
function setBusinessCoordinates(lat,lng){
 $("#bizLatitude").value=Number(lat).toFixed(7);$("#bizLongitude").value=Number(lng).toFixed(7);
 if(businessMarker)businessMarker.setLatLng([lat,lng]);
}
function initBusinessMap(){
 if(!window.L||businessMap)return;
 businessMap=L.map("bizMap").setView([21.1458,79.0882],5);
 L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap contributors"}).addTo(businessMap);
 businessMarker=L.marker([21.1458,79.0882],{draggable:true}).addTo(businessMap);
 businessMarker.on("dragend",async()=>{const p=businessMarker.getLatLng();setBusinessCoordinates(p.lat,p.lng);await reverseGeocodeBusiness(p.lat,p.lng)});
 businessMap.on("click",async e=>{setBusinessCoordinates(e.latlng.lat,e.latlng.lng);await reverseGeocodeBusiness(e.latlng.lat,e.latlng.lng)});
 $("#bizLocateBtn").addEventListener("click",()=>{
  if(!navigator.geolocation)return toast("Location is not available in this browser.");
  navigator.geolocation.getCurrentPosition(async pos=>{const {latitude,longitude}=pos.coords;setBusinessCoordinates(latitude,longitude);businessMap.setView([latitude,longitude],16);await reverseGeocodeBusiness(latitude,longitude)},err=>toast(err.message||"Unable to get your location."),{enableHighAccuracy:true,timeout:10000});
 });
 $("#bizSearchAddressBtn")?.addEventListener("click",locateBusinessAddress);
}
function openBusinessDialog(){
  openDialog("businessDialog");
  setTimeout(()=>{
    initBusinessMap();
    if(businessMap){businessMap.invalidateSize();const lat=Number($("#bizLatitude").value),lng=Number($("#bizLongitude").value);if(Number.isFinite(lat)&&Number.isFinite(lng)&&lat!==0&&lng!==0){setBusinessCoordinates(lat,lng);businessMap.setView([lat,lng],15)}}
  },150);
}
function openDialog(id){$("#"+id).showModal()}
function closeDialog(id){$("#"+id).close()}
$$("[data-close]").forEach(b=>b.addEventListener("click",()=>closeDialog(b.dataset.close)));
$("#year").textContent=new Date().getFullYear();
$("#langToggle").addEventListener("click",()=>{lang=lang==="en"?"hi":"en";applyLanguage()});
$("#menuBtn").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));

const profileMenu=$("#profileMenu");
$("#accountBtn").addEventListener("click",(e)=>{e.stopPropagation();if(!session){showAuth("login");return;}profileMenu.hidden=!profileMenu.hidden;});
document.addEventListener("click",e=>{if(profileMenu&&!profileMenu.contains(e.target)&&!$("#accountBtn").contains(e.target))profileMenu.hidden=true;});
$$("[data-profile-action]").forEach(b=>b.addEventListener("click",()=>{const action=b.dataset.profileAction;profileMenu.hidden=true;if(action==="login")showAuth("login");else if(action==="logout")signOut();else if(action==="profile")openDialog("profileSettingsDialog");else if(action==="add-business")openBusinessRequest();else if(action==="products")$("#products").scrollIntoView({behavior:"smooth"});else if(action==="enquiries")toast("Send enquiries from individual business pages.");}));

$("#exploreBtn").addEventListener("click",()=>$("#businesses").scrollIntoView({behavior:"smooth"}));
$("#verifyBtn").addEventListener("click",openVerification);
$("#verifyNowBtn").addEventListener("click",openVerification);
function openBusinessRequest(){if(!session)return showAuth("login");if(effectiveAccountType==="business_owner"||effectiveAccountType==="admin"){location.href="./owner/";return;}populateBusinessCategories();loadIndiaDistricts().then(()=>setupIndiaLocation("bizState","bizDistrict","Uttar Pradesh",""));openBusinessDialog();}
$("#addBusinessBtn").addEventListener("click",()=>{if(!session)return showAuth("login");if(effectiveAccountType==="business_owner"||effectiveAccountType==="admin"){location.href="./owner/";return;}if(!profile)return toast("Profile is loading. Try again.");populateBusinessCategories();loadIndiaDistricts().then(()=>setupIndiaLocation("bizState","bizDistrict","Uttar Pradesh",""));openBusinessDialog()});
$("#addProductBtn").addEventListener("click",async()=>{if(!session)return showAuth("login");if(!ownerBusinesses.length)await loadOwnerBusinesses();if(!ownerBusinesses.length)return toast("Add a business listing first.");$("#productBusiness").innerHTML=ownerBusinesses.map(b=>`<option value="${b.id}">${escapeHtml(b.name)}</option>`).join("");openDialog("productDialog")});
$("#searchBtn").addEventListener("click",renderBusinesses);
$("#searchInput").addEventListener("input",renderBusinesses);
$$(".category").forEach(b=>b.addEventListener("click",()=>{$$(".category").forEach(x=>x.classList.remove("active"));b.classList.add("active");categoryFilter=b.dataset.category;renderBusinesses()}));
$$(".filter").forEach(b=>b.addEventListener("click",()=>{$$(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");statusFilter=b.dataset.filter;renderBusinesses()}));
$$("[data-auth-mode]").forEach(b=>b.addEventListener("click",()=>showAuth(b.dataset.authMode)));

function showAuth(mode="login"){
  authMode="login";
  $("#authTitle").textContent="Sign in to ABN";
  $("#authHint").textContent="Use your Google account to continue. New users are registered automatically.";
  $("#authMessage").textContent="";
  openDialog("authDialog");
}
$("#googleAuthBtn").addEventListener("click",async()=>{
  const btn=$("#googleAuthBtn");btn.disabled=true;$("#authMessage").textContent="";
  try{
    const {error}=await supabase.auth.signInWithOAuth({
      provider:"google",
      options:{redirectTo:location.origin+location.pathname}
    });
    if(error)throw error;
  }catch(err){$("#authMessage").textContent=err.message||"Google sign-in could not start.";btn.disabled=false;}
});
async function signOut(){await supabase.auth.signOut();toast("Signed out.");}
supabase.auth.onAuthStateChange((_event,newSession)=>{session=newSession;setTimeout(refreshUserUI,0)});
async function init(){
  applyLanguage();
  const {data}=await supabase.auth.getSession();session=data.session;
  await loadCategories();await loadBusinesses();await refreshUserUI();
}
async function loadCategories(){
  const {data,error}=await supabase.from("business_categories").select("id,name_en,name_hi,slug").eq("is_active",true).order("sort_order");
  if(!error&&data){categories=data;populateBusinessCategories()}
}
function populateBusinessCategories(){
  $("#bizCategory").innerHTML=categories.map(c=>`<option value="${c.id}">${escapeHtml(lang==="hi"?c.name_hi:c.name_en)}</option>`).join("");
}
async function loadBusinesses(){
  const {data,error}=await supabase.from("businesses").select("id,name,slug,description,phone,city,state,address,address_line2,landmark,district,pincode,latitude,longitude,image_urls,logo_url,cover_url,verification_status,listing_status,average_rating,review_count,category_id,business_categories(name_en,name_hi,slug)").eq("listing_status","published").order("created_at",{ascending:false}).limit(60);
  if(error){$("#businessGrid").innerHTML=`<div class="empty">Unable to load listings: ${escapeHtml(error.message)}</div>`;return}
  allBusinesses=data||[];renderBusinesses();await loadProducts();
}
async function loadProducts(){
  const {data,error}=await supabase.from("products_services").select("id,business_id,item_type,name,name_hi,description,description_hi,price,price_unit,image_url,businesses(name,city)").eq("is_active",true).order("created_at",{ascending:false}).limit(36);
  if(error){$("#productGrid").innerHTML=`<p class="muted">${escapeHtml(error.message)}</p>`;return}
  $("#productGrid").innerHTML=data?.length?data.map(p=>`<article class="product-card">${p.image_url?`<img class="product-image" src="${escapeHtml(p.image_url)}" alt="" loading="lazy">`:""}<b>${escapeHtml(lang==="hi"?(p.name_hi||p.name):p.name)}</b><p>${escapeHtml(p.businesses?.name||"ABN Business")} · ${p.item_type}</p><p>${escapeHtml(p.description||"")}</p><strong>${p.price==null?"Price on request":"₹"+Number(p.price).toLocaleString("en-IN")}${p.price_unit?" / "+escapeHtml(p.price_unit):""}</strong></article>`).join(""):'<div class="empty">No products or services listed yet. Business owners can add their offerings.</div>';
}
function renderBusinesses(){
  const q=$("#searchInput").value.trim().toLowerCase();
  const list=allBusinesses.filter(b=>(!categoryFilter||b.business_categories?.slug===categoryFilter)&&(!q||[b.name,b.description,b.city,b.business_categories?.name_en].join(" ").toLowerCase().includes(q))&&(statusFilter==="all"||(statusFilter==="verified"?b.verification_status==="verified":b.verification_status!=="verified")));
  $("#businessGrid").innerHTML=list.length?list.map(b=>{
    const verified=b.verification_status==="verified";
    const cover=b.cover_url||"https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=700&q=75";
    const logo=b.logo_url||"";
    return `<article class="business-card"><div class="business-cover"><img src="${escapeHtml(cover)}" alt="" loading="lazy"><span class="verified-tag ${verified?"":"no"}">${verified?"✓ VERIFIED":"◉ NOT VERIFIED"}</span></div><div class="business-body"><div class="business-title">${logo?`<img class="business-logo" src="${escapeHtml(logo)}" alt="">`:`<span class="business-logo"></span>`}<h3>${escapeHtml(b.name)}</h3></div><div class="business-meta"><span>▣ ${escapeHtml(b.business_categories?.[lang==="hi"?"name_hi":"name_en"]||"Business")}</span><span>📍 ${escapeHtml([b.city,b.state].filter(Boolean).join(", ")||"India")}</span><span class="rating">★ ${Number(b.average_rating||0).toFixed(1)} (${b.review_count||0} reviews)</span></div><div class="chips"><span class="chip">${escapeHtml(b.business_categories?.name_en||"Local Business")}</span><span class="chip">ABN Network</span></div><div class="card-actions"><button class="primary-btn" data-view-business="${b.id}">View Business</button><button class="secondary-btn" data-enquire="${b.id}">Enquire</button></div></div></article>`
  }).join(""):`<div class="empty">No published businesses match your search yet. Business owners can add a listing after signing up.</div>`;
  $$("[data-enquire]").forEach(btn=>btn.addEventListener("click",()=>openEnquiry(btn.dataset.enquire)));
  $$("[data-view-business]").forEach(btn=>btn.addEventListener("click",()=>openBusinessDetail(btn.dataset.viewBusiness)));
}
async function openBusinessDetail(id){
  const b=allBusinesses.find(x=>x.id===id);if(!b)return;
  const panel=$("#businessDetailContent");
  panel.innerHTML='<p class="muted">Loading business details…</p>';openDialog("businessDetailDialog");
  const [{data:branches,error:branchError},{data:items,error:itemError}]=await Promise.all([
    supabase.from("business_branches").select("*").eq("business_id",id).eq("is_active",true).order("created_at"),
    supabase.from("products_services").select("id,item_type,name,description,price,price_unit,image_url").eq("business_id",id).eq("is_active",true).order("created_at",{ascending:false}).limit(30)
  ]);
  const address=[b.address,b.address_line2,b.landmark,b.city,b.district,b.state,b.pincode,b.country||"India"].filter(Boolean).join(", ");
  const galleryHtml=Array.isArray(b.image_urls)&&b.image_urls.length?'<div class="business-gallery">'+b.image_urls.map(url=>'<img src="'+escapeHtml(url)+'" alt="Business photo" loading="lazy">').join("")+'</div>':"";
  const mapLink=(b.latitude&&b.longitude)?'https://www.openstreetmap.org/?mlat='+encodeURIComponent(b.latitude)+'&mlon='+encodeURIComponent(b.longitude)+'#map=17/'+encodeURIComponent(b.latitude)+'/'+encodeURIComponent(b.longitude):"";
  const branchHtml=branchError?'<p class="muted">Unable to load branches.</p>':(branches||[]).length?(branches||[]).map(x=>'<article class="branch-card"><b>'+escapeHtml(x.branch_name)+'</b><p>'+escapeHtml([x.address_line1,x.address_line2,x.landmark,x.area,x.city,x.district,x.state,x.pincode,x.country].filter(Boolean).join(", "))+'</p><p>'+escapeHtml([x.phone,x.alternate_phone,x.whatsapp,x.email].filter(Boolean).join(" · "))+'</p>'+(x.opening_hours?.text?'<p>'+escapeHtml(x.opening_hours.text)+'</p>':'')+'</article>').join(""):'<p class="muted">No branches or outlets listed.</p>';
  const itemHtml=itemError?'<p class="muted">Unable to load products and services.</p>':(items||[]).length?(items||[]).map(x=>'<article class="product-card">'+(x.image_url?'<img class="product-image" src="'+escapeHtml(x.image_url)+'" alt="">':'')+'<b>'+escapeHtml(x.name)+'</b><p>'+escapeHtml(x.description||"")+'</p><strong>'+(x.price==null?"Price on request":"₹"+Number(x.price).toLocaleString("en-IN"))+(x.price_unit?" / "+escapeHtml(x.price_unit):"")+'</strong></article>').join(""):'<p class="muted">No products or services listed.</p>';
  panel.innerHTML='<div class="business-detail-hero">'+(b.cover_url?'<img src="'+escapeHtml(b.cover_url)+'" alt="">':'')+'<div><h2>'+escapeHtml(b.name)+'</h2><p>'+escapeHtml(b.description||"")+'</p></div></div>'+galleryHtml+'<h3>Business address</h3><p>'+escapeHtml(address||"Address not provided")+'</p>'+(mapLink?'<p><a href="'+mapLink+'" target="_blank" rel="noopener">Open location on map ↗</a></p>':'')+'<p>'+escapeHtml([b.phone].filter(Boolean).join(" · "))+'</p><h3>Products & services</h3><div class="product-grid">'+itemHtml+'</div><h3>Branches & outlets</h3>'+branchHtml+'<button class="primary-btn wide" id="detailEnquireBtn">Send enquiry</button>';
  $("#detailEnquireBtn").addEventListener("click",()=>{closeDialog("businessDetailDialog");openEnquiry(id)});
}
function openEnquiry(id){
  $("#enquiryBusinessId").value=id;
  if(session){$("#enquiryName").value=profile?.full_name||"";$("#enquiryEmail").value=session.user.email||""}
  openDialog("enquiryDialog");
}
$("#enquiryForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const payload={business_id:$("#enquiryBusinessId").value,customer_id:session?.user.id||null,customer_name:$("#enquiryName").value.trim(),customer_email:$("#enquiryEmail").value.trim()||null,customer_phone:$("#enquiryPhone").value.trim()||null,message:$("#enquiryMessage").value.trim()};
  const {error}=await supabase.from("enquiries").insert(payload);
  $("#enquiryStatus").textContent=error?error.message:"Enquiry sent. The business owner can now respond.";
  if(!error){e.target.reset();toast("Enquiry sent.")}
});
async function refreshUserUI(){
  if(!session){profile=null;ownerBusinesses=[];effectiveAccountType="consumer";$("#menuName").textContent="Welcome to ABN";$("#menuEmail").textContent="Sign in to your account";$("#menuLogin").hidden=false;$("#menuLogout").hidden=true;$("#menuAvatar").textContent="AB";$("#headerAvatar").outerHTML='<span id="headerAvatar" class="header-avatar-fallback">AB</span>';$("#ownerPanel").innerHTML=`<p class="muted">${translations[lang].loginOwner}</p>`;$("#branchPanel").innerHTML='<p class="muted">Sign in as a business owner to manage branches and outlets.</p>';$("#enquiryPanel").innerHTML='<p class="muted">Login to view enquiries.</p>';$("#profilePanel").innerHTML='<p class="muted">Sign in to view your profile.</p>';$("#adminSection").classList.add("hidden");return}
  
  const {data}=await supabase.from("profiles").select("full_name,phone,avatar_url,preferred_language,account_type").eq("id",session.user.id).maybeSingle();profile=data;const roleResult=await supabase.rpc("abn_effective_account_type");effectiveAccountType=roleResult.data||"consumer";const roleLabels={consumer:"Consumer / User",business_owner:"Business Owner",staff:"ABN Staff",admin:"Administrator"};
  $("#menuName").textContent=profile?.full_name||"ABN Member";$("#menuEmail").textContent=session.user.email||"";$("#menuLogin").hidden=true;$("#menuLogout").hidden=false;$("#menuAvatar").textContent=(profile?.full_name||session.user.email||"AB").trim().slice(0,2).toUpperCase();const avatarNode=$("#headerAvatar");if(avatarNode){if(profile?.avatar_url){const img=document.createElement("img");img.id="headerAvatar";img.className="header-avatar";img.src=profile.avatar_url;img.alt="Profile";avatarNode.replaceWith(img)}else{avatarNode.textContent=(profile?.full_name||session.user.email||"AB").trim().slice(0,2).toUpperCase();avatarNode.className="header-avatar-fallback"}}
  $("#profilePanel").innerHTML=`<div class="profile-card">${profile?.avatar_url?`<img class="profile-avatar" src="${escapeHtml(profile.avatar_url)}" alt="Profile photo">`:`<span class="profile-avatar profile-avatar-empty">ABN</span>`}<div><b>${escapeHtml(profile?.full_name||session.user.email)}</b><p class="muted">${escapeHtml(session.user.email)} · ${escapeHtml(roleLabels[effectiveAccountType]||"Consumer / User")}</p></div></div><form id="avatarForm" class="avatar-form"><label class="form-field">Profile picture (JPG/PNG/WEBP, max 5 MB)<input id="avatarFile" type="file" accept="image/jpeg,image/png,image/webp" required></label><button class="secondary-btn" type="submit">Upload profile picture</button><span id="avatarMessage" class="muted"></span></form><button class="secondary-btn" id="logoutBtn">Logout</button>`;
  $("#logoutBtn").addEventListener("click",signOut);
  $("#avatarForm").addEventListener("submit",async e=>{
    e.preventDefault();const btn=e.submitter;if(btn)btn.disabled=true;
    try{
      const url=await uploadUserFile($("#avatarFile").files[0],"abn-business-media","avatars",5);
      const {error}=await supabase.from("profiles").update({avatar_url:url}).eq("id",session.user.id);
      if(error)throw error;toast("Profile picture updated.");await refreshUserUI();
    }catch(err){$("#avatarMessage").textContent=err.message||"Unable to upload profile picture."}
    finally{if(btn)btn.disabled=false}
  });

  if(location.pathname.replace(/\/+$/,"").endsWith("/owner")&&!["business_owner","admin"].includes(effectiveAccountType)){toast("Business Owner access is required.");location.replace("../");return;}
  await loadOwnerBusinesses();await loadProducts();
  // Administration is handled only in the dedicated /admin/ portal.
  $("#adminSection").classList.add("hidden");
}
let ownerBusinesses=[];
async function loadBranches(){
  const panel=$("#branchPanel");
  if(!session){panel.innerHTML='<p class="muted">Sign in as a business owner to manage branches and outlets.</p>';return}
  if(!ownerBusinesses.length){panel.innerHTML='<p class="muted">Add a business listing first, then you can add its branches and outlets.</p>';return}
  const ids=ownerBusinesses.map(b=>b.id);
  const {data,error}=await supabase.from("business_branches").select("*").in("business_id",ids).order("created_at",{ascending:false});
  if(error){panel.innerHTML='<p class="muted">'+escapeHtml(error.message)+'</p>';return}
  const cards=(data||[]).map(b=>{
    const address=[b.address_line1,b.address_line2,b.landmark,b.area,b.city,b.district,b.state,b.pincode,b.country].filter(Boolean).join(", ");
    const contacts=[b.phone,b.alternate_phone,b.whatsapp,b.email].filter(Boolean).join(" · ");
    return '<article class="branch-card"><div class="branch-card-head"><div><b>'+escapeHtml(b.branch_name)+'</b><div class="branch-type">'+escapeHtml((b.branch_type||"branch").replaceAll("_"," "))+' · '+(b.is_active?"Active":"Inactive")+'</div></div><div class="branch-buttons"><button class="secondary-btn" data-edit-branch="'+b.id+'">Edit</button><button class="secondary-btn" data-delete-branch="'+b.id+'">Delete</button></div></div><p>'+escapeHtml(address)+'</p><p>'+escapeHtml(contacts)+'</p>'+(b.opening_hours?.text?'<p>'+escapeHtml(b.opening_hours.text)+'</p>':'')+'</article>';
  }).join("");
  panel.innerHTML='<div class="branch-actions"><button class="primary-btn" id="addBranchBtn">＋ Add branch / outlet</button></div>'+(cards||'<p class="muted">No branches added yet.</p>');
  $("#addBranchBtn").addEventListener("click",()=>openBranchForm());
  $$("[data-edit-branch]").forEach(btn=>btn.addEventListener("click",()=>openBranchForm((data||[]).find(x=>x.id===btn.dataset.editBranch))));
  $$("[data-delete-branch]").forEach(btn=>btn.addEventListener("click",async()=>{
    if(!confirm("Delete this branch / outlet?"))return;
    btn.disabled=true;const {error}=await supabase.from("business_branches").delete().eq("id",btn.dataset.deleteBranch);
    if(error){toast(error.message);btn.disabled=false;return}
    toast("Branch / outlet deleted.");await loadBranches();
  }));
}
function openBranchForm(branch=null){
  if(!session)return showAuth("login");
  $("#branchForm").reset();
  $("#branchId").value=branch?.id||"";
  $("#branchDialogTitle").textContent=branch?"Edit branch / outlet":"Add branch / outlet";
  $("#branchBusiness").innerHTML=ownerBusinesses.map(b=>'<option value="'+b.id+'">'+escapeHtml(b.name)+'</option>').join("");
  const fields={branchName:"branch_name",branchType:"branch_type",branchContactPerson:"contact_person",branchPhone:"phone",branchAltPhone:"alternate_phone",branchWhatsapp:"whatsapp",branchEmail:"email",branchAddress1:"address_line1",branchAddress2:"address_line2",branchLandmark:"landmark",branchArea:"area",branchDistrict:"district",branchState:"state",branchPincode:"pincode",branchCountry:"country",branchLatitude:"latitude",branchLongitude:"longitude"};
  for(const [id,key] of Object.entries(fields))$("#"+id).value=branch?.[key]??(id==="branchCountry"?"India":"");
  $("#branchBusiness").value=branch?.business_id||ownerBusinesses[0].id;
  $("#branchHours").value=branch?.opening_hours?.text||"";loadIndiaDistricts().then(()=>setupIndiaLocation("branchState","branchDistrict",branch?.state||"",""+(branch?.district||"")));
  $("#branchActive").checked=branch?.is_active??true;
  $("#branchMessage").textContent="";
  openDialog("branchDialog");
}
$("#branchForm").addEventListener("submit",async e=>{
  e.preventDefault();if(!session)return showAuth("login");
  const num=id=>$("#"+id).value.trim()===""?null:Number($("#"+id).value);
  const payload={business_id:$("#branchBusiness").value,branch_name:$("#branchName").value.trim(),branch_type:$("#branchType").value,contact_person:$("#branchContactPerson").value.trim()||null,phone:$("#branchPhone").value.trim()||null,alternate_phone:$("#branchAltPhone").value.trim()||null,whatsapp:$("#branchWhatsapp").value.trim()||null,email:$("#branchEmail").value.trim()||null,address_line1:$("#branchAddress1").value.trim(),address_line2:$("#branchAddress2").value.trim()||null,landmark:$("#branchLandmark").value.trim()||null,area:$("#branchArea").value.trim()||null,city:null,district:$("#branchDistrict").value.trim()||null,state:$("#branchState").value.trim(),pincode:$("#branchPincode").value.trim()||null,country:$("#branchCountry").value.trim()||"India",latitude:num("branchLatitude"),longitude:num("branchLongitude"),opening_hours:$("#branchHours").value.trim()?{text:$("#branchHours").value.trim()}: {},is_active:$("#branchActive").checked};
  const id=$("#branchId").value;
  const result=id?await supabase.from("business_branches").update(payload).eq("id",id):await supabase.from("business_branches").insert(payload);
  $("#branchMessage").textContent=result.error?result.error.message:(id?"Branch updated.":"Branch added.");
  if(!result.error){toast(id?"Branch updated.":"Branch added.");closeDialog("branchDialog");await loadBranches()}
});
async function loadOwnerBusinesses(){
  const {data,error}=await supabase.from("businesses").select("id,name,listing_status,verification_status,created_at").eq("owner_id",session.user.id).order("created_at",{ascending:false});
  ownerBusinesses=data||[];
  $("#ownerPanel").innerHTML=error?`<p class="muted">${escapeHtml(error.message)}</p>`:ownerBusinesses.length?ownerBusinesses.map(b=>`<div class="owner-row"><div><b>${escapeHtml(b.name)}</b><p class="muted">${new Date(b.created_at).toLocaleDateString()}</p></div><div><span class="status ${b.listing_status}">${b.listing_status}</span> <span class="status ${b.verification_status}">${b.verification_status}</span></div></div>`).join(""):'<p class="muted">No business listings yet. Select “Add Business” to create your first listing.</p>';
  await loadBranches();
  $("#enquiryPanel").innerHTML='<p class="muted">Enquiries linked to your businesses will appear here.</p>';
  if(ownerBusinesses.length){
    const ids=ownerBusinesses.map(b=>b.id);
    const {data:enquiries}=await supabase.from("enquiries").select("id,business_id,customer_name,message,status,created_at").in("business_id",ids).order("created_at",{ascending:false}).limit(30);
    $("#enquiryPanel").innerHTML=enquiries?.length?enquiries.map(e=>`<div class="enquiry-row"><div><b>${escapeHtml(e.customer_name)}</b><p class="muted">${escapeHtml(e.message)}</p></div><span class="status">${escapeHtml(e.status)}</span></div>`).join(""):'<p class="muted">No enquiries received yet.</p>';
  }
}
$("#businessForm").addEventListener("submit",async e=>{
  e.preventDefault();if(!session)return showAuth("login");
  const btn=e.submitter; if(btn)btn.disabled=true;
  try{
    const name=$("#bizName").value.trim();
    const media=$("#bizPhotos")?.files||[];
    if(media.length>8)throw new Error("Upload up to 8 business photos.");
    const urls=[];
    for(const file of media)urls.push(await uploadUserFile(file,"abn-business-media","business",5));
    const logo=await uploadUserFile($("#bizLogo")?.files?.[0],"abn-business-media","logos",5);
    const cover=await uploadUserFile($("#bizCover")?.files?.[0],"abn-business-media","covers",5);
    const payload={owner_id:session.user.id,category_id:$("#bizCategory").value,name,slug:slugify(name),business_type:$("#bizType").value,phone:$("#bizPhone").value.trim()||null,city:null,description:$("#bizDescription").value.trim()||null,address:$("#bizAddress")?.value.trim()||null,address_line2:$("#bizAddress2")?.value.trim()||null,landmark:$("#bizLandmark")?.value.trim()||null,district:$("#bizDistrict")?.value.trim()||null,state:$("#bizState")?.value.trim()||null,pincode:$("#bizPincode")?.value.trim()||null,country:"India",latitude:$("#bizLatitude")?.value?Number($("#bizLatitude").value):null,longitude:$("#bizLongitude")?.value?Number($("#bizLongitude").value):null,image_urls:urls,logo_url:logo,cover_url:cover,listing_status:"pending",verification_status:"pending"};
    const {data:requestResult,error}=await supabase.functions.invoke("consumer-business-application",{body:payload});if(error)throw error;
    $("#businessMessage").textContent="Business application submitted. Your consumer account stays active while ABN reviews your application.";
    e.target.reset();await loadOwnerBusinesses();toast("Business submitted for review.");
  }catch(err){$("#businessMessage").textContent=err.message||"Unable to save business."}
  finally{if(btn)btn.disabled=false}
});
$("#productForm").addEventListener("submit",async e=>{
  e.preventDefault();if(!session)return showAuth("login");
  const btn=e.submitter;if(btn)btn.disabled=true;
  try{
    const image=await uploadUserFile($("#productImage")?.files?.[0],"abn-business-media","products",5);
    const price=$("#productPrice").value;
    const payload={business_id:$("#productBusiness").value,item_type:$("#productType").value,name:$("#productName").value.trim(),description:$("#productDescription").value.trim()||null,price:price?Number(price):null,price_unit:$("#productUnit").value.trim()||null,image_url:image,is_active:true};
    const {error}=await supabase.from("products_services").insert(payload);if(error)throw error;
    $("#productMessage").textContent="Product / service saved.";e.target.reset();await loadProducts();toast("Product / service added.");
  }catch(err){$("#productMessage").textContent=err.message||"Unable to save product."}
  finally{if(btn)btn.disabled=false}
});
function openVerification(){
  if(!session)return showAuth("login");
  if(!ownerBusinesses.length)return toast("Add a business listing first.");
  $("#verificationBusiness").innerHTML=ownerBusinesses.map(b=>`<option value="${b.id}">${escapeHtml(b.name)}</option>`).join("");
  openDialog("verificationDialog");
}
$("#verificationForm").addEventListener("submit",async e=>{
  e.preventDefault();if(!session)return showAuth("login");
  const btn=e.submitter;if(btn)btn.disabled=true;
  try{
    const file=$("#verificationFile")?.files?.[0];if(!file)throw new Error("Choose a document to upload.");
    const path=await uploadUserFile(file,"abn-verification-docs","verification",10);
    const {error}=await supabase.from("business_verification_requests").insert({business_id:$("#verificationBusiness").value,submitted_by:session.user.id,document_type:$("#documentType").value,document_url:path,notes:$("#verificationNotes").value.trim()||null});
    if(error)throw error;$("#verificationStatus").textContent="Verification request submitted securely.";toast("Verification request submitted.");e.target.reset();
  }catch(err){$("#verificationStatus").textContent=err.message||"Unable to submit verification."}
  finally{if(btn)btn.disabled=false}
});
async function loadAdminPanel(){
  const {data,error}=await supabase.from("businesses").select("id,name,city,listing_status,verification_status,created_at").eq("listing_status","pending").order("created_at").limit(50);
  $("#adminPanel").innerHTML=error?escapeHtml(error.message):(data?.length?data.map(b=>`<div class="admin-row"><div><b>${escapeHtml(b.name)}</b><p class="muted">${escapeHtml(b.city||"")} · ${b.verification_status}</p></div><button class="primary-btn" data-approve="${b.id}">Approve & Publish</button></div>`).join(""):"No pending listings.");
  $$("[data-approve]").forEach(btn=>btn.addEventListener("click",async()=>{
    btn.disabled=true;const {error}=await supabase.functions.invoke("approve-business-application",{body:{business_id:btn.dataset.approve}});
    if(error)toast(error.message);else{toast("Business approved and published. Email status: "+(data?.email_sent?"sent":"SMTP may need setup"));await loadAdminPanel();await loadBusinesses()}
    btn.disabled=false;
  }));
  const {data:requests, error:requestError}=await supabase.from("business_verification_requests").select("id,business_id,document_type,document_url,notes,status,created_at,businesses(name)").eq("status","pending").order("created_at",{ascending:true}).limit(30);
  const verificationHtml=requestError?'<p class="muted">'+escapeHtml(requestError.message)+'</p>':(requests||[]).length?(requests||[]).map(r=>'<div class="admin-row"><div><b>'+escapeHtml(r.businesses?.name||"Business")+'</b><p class="muted">'+escapeHtml(r.document_type)+' · '+new Date(r.created_at).toLocaleDateString()+'</p><button class="text-btn" data-view-doc="'+r.id+'">Open private document</button></div><div><button class="primary-btn" data-verify-approve="'+r.id+'">Approve</button> <button class="secondary-btn" data-verify-reject="'+r.id+'">Reject</button></div></div>').join(""):'<p class="muted">No pending verification requests.</p>';
  let section=$("#verificationAdminPanel");
  if(!section){section=document.createElement("div");section.id="verificationAdminPanel";$("#adminPanel").after(section)}
  section.innerHTML='<h3>Verification requests</h3>'+verificationHtml;
  $$("[data-view-doc]").forEach(btn=>btn.addEventListener("click",async()=>{
    const item=(requests||[]).find(x=>x.id===btn.dataset.viewDoc);if(!item)return;
    const {data,error}=await supabase.storage.from("abn-verification-docs").createSignedUrl(item.document_url,300);
    if(error)toast(error.message);else window.open(data.signedUrl,"_blank","noopener,noreferrer");
  }));
  async function reviewVerification(id,status){
    const {error}=await supabase.rpc("admin_review_verification",{p_request_id:id,p_status:status,p_review_notes:status==="rejected"?"Please contact ABN support for details.":null});
    if(error){toast(error.message);return}
    toast("Verification "+status+".");await loadAdminPanel();await loadBusinesses();
  }
  $$("[data-verify-approve]").forEach(btn=>btn.addEventListener("click",()=>reviewVerification(btn.dataset.verifyApprove,"approved")));
  $$("[data-verify-reject]").forEach(btn=>btn.addEventListener("click",()=>reviewVerification(btn.dataset.verifyReject,"rejected")));

}
init().catch(err=>toast(err.message||"Unable to initialize ABN."));
