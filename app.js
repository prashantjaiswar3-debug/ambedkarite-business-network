import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

// Public browser credentials only. Never put a service_role/secret key in this file.
const SUPABASE_URL = "https://ztwownezpjrbeowwhaxw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ZIkPhkCRyOlRG-Gci9s_lg_DnBoAXh0";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
let session = null, profile = null, allBusinesses = [], categories = [], categoryFilter = "", statusFilter = "all", authMode = "login", lang = localStorage.getItem("abn-language") || "en";
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
function openDialog(id){$("#"+id).showModal()}
function closeDialog(id){$("#"+id).close()}
$$("[data-close]").forEach(b=>b.addEventListener("click",()=>closeDialog(b.dataset.close)));
$("#year").textContent=new Date().getFullYear();
$("#langToggle").addEventListener("click",()=>{lang=lang==="en"?"hi":"en";applyLanguage()});
$("#menuBtn").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
$("#accountBtn").addEventListener("click",()=>session?signOut():showAuth("login"));
$("#exploreBtn").addEventListener("click",()=>$("#businesses").scrollIntoView({behavior:"smooth"}));
$("#verifyBtn").addEventListener("click",openVerification);
$("#verifyNowBtn").addEventListener("click",openVerification);
$("#addBusinessBtn").addEventListener("click",()=>{if(!session)return showAuth("login");if(!profile)return toast("Profile is loading. Try again.");populateBusinessCategories();openDialog("businessDialog")});
$("#addProductBtn").addEventListener("click",async()=>{if(!session)return showAuth("login");if(!ownerBusinesses.length)await loadOwnerBusinesses();if(!ownerBusinesses.length)return toast("Add a business listing first.");$("#productBusiness").innerHTML=ownerBusinesses.map(b=>`<option value="${b.id}">${escapeHtml(b.name)}</option>`).join("");openDialog("productDialog")});
$("#searchBtn").addEventListener("click",renderBusinesses);
$("#searchInput").addEventListener("input",renderBusinesses);
$$(".category").forEach(b=>b.addEventListener("click",()=>{$$(".category").forEach(x=>x.classList.remove("active"));b.classList.add("active");categoryFilter=b.dataset.category;renderBusinesses()}));
$$(".filter").forEach(b=>b.addEventListener("click",()=>{$$(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");statusFilter=b.dataset.filter;renderBusinesses()}));
$$("[data-auth-mode]").forEach(b=>b.addEventListener("click",()=>showAuth(b.dataset.authMode)));

function showAuth(mode){
  authMode=mode;$("#authTitle").textContent=mode==="login"?"Welcome back":"Create your ABN account";
  $("#authHint").textContent=mode==="login"?"Login to your account.":"Join the Ambedkarite Business Network.";
  $("#nameField").classList.toggle("hidden",mode!=="signup");$("#accountTypeField").classList.toggle("hidden",mode!=="signup");
  $("#forgotBtn").classList.toggle("hidden",mode!=="login");$("#authSubmit").textContent=mode==="login"?"Login":"Create account";
  $$("[data-auth-mode]").forEach(b=>b.classList.toggle("active",b.dataset.authMode===mode));$("#authMessage").textContent="";
  openDialog("authDialog");
}
$("#authForm").addEventListener("submit",async e=>{
  e.preventDefault();const btn=$("#authSubmit");btn.disabled=true;$("#authMessage").textContent="";
  try{
    const email=$("#authEmail").value.trim(),password=$("#authPassword").value;
    if(authMode==="signup"){
      const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:$("#authName").value.trim(),preferred_language:lang,account_type:$("#accountType").value}}});
      if(error)throw error;
      if(data.session){toast("Account created successfully.");closeDialog("authDialog")}
      else $("#authMessage").textContent="Account created. Check your email to confirm your address, then log in.";
    }else{
      const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;
      closeDialog("authDialog");toast("Login successful.");
    }
  }catch(err){$("#authMessage").textContent=err.message||"Something went wrong."}
  finally{btn.disabled=false}
});
$("#forgotBtn").addEventListener("click",async()=>{
  const email=$("#authEmail").value.trim();if(!email)return $("#authMessage").textContent="Enter your email address first.";
  const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:location.href});
  $("#authMessage").textContent=error?error.message:"Password reset email sent.";
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
  const {data,error}=await supabase.from("products_services").select("id,business_id,item_type,name,name_hi,description,description_hi,price,price_unit,businesses(name,city)").eq("is_active",true).order("created_at",{ascending:false}).limit(36);
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
    return `<article class="business-card"><div class="business-cover"><img src="${escapeHtml(cover)}" alt="" loading="lazy"><span class="verified-tag ${verified?"":"no"}">${verified?"✓ VERIFIED":"◉ NOT VERIFIED"}</span></div><div class="business-body"><div class="business-title">${logo?`<img class="business-logo" src="${escapeHtml(logo)}" alt="">`:`<span class="business-logo"></span>`}<h3>${escapeHtml(b.name)}</h3></div><div class="business-meta"><span>▣ ${escapeHtml(b.business_categories?.[lang==="hi"?"name_hi":"name_en"]||"Business")}</span><span>📍 ${escapeHtml([b.city,b.state].filter(Boolean).join(", ")||"India")}</span><span class="rating">★ ${Number(b.average_rating||0).toFixed(1)} (${b.review_count||0} reviews)</span></div><div class="chips"><span class="chip">${escapeHtml(b.business_categories?.name_en||"Local Business")}</span><span class="chip">ABN Network</span></div><div class="card-actions"><button class="primary-btn" data-enquire="${b.id}">View / Enquire</button></div></div></article>`
  }).join(""):`<div class="empty">No published businesses match your search yet. Business owners can add a listing after signing up.</div>`;
  $$("[data-enquire]").forEach(btn=>btn.addEventListener("click",()=>openEnquiry(btn.dataset.enquire)));
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
  if(!session){profile=null;ownerBusinesses=[];$("#accountBtn").textContent="Login / Sign up";$("#ownerPanel").innerHTML=`<p class="muted">${translations[lang].loginOwner}</p>`;$("#branchPanel").innerHTML='<p class="muted">Sign in as a business owner to manage branches and outlets.</p>';$("#enquiryPanel").innerHTML='<p class="muted">Login to view enquiries.</p>';$("#profilePanel").innerHTML='<p class="muted">Sign in to view your profile.</p>';$("#adminSection").classList.add("hidden");return}
  $("#accountBtn").textContent=session.user.email.split("@")[0];
  const {data}=await supabase.from("profiles").select("full_name,phone,preferred_language,account_type").eq("id",session.user.id).maybeSingle();profile=data;
  $("#profilePanel").innerHTML=`<b>${escapeHtml(profile?.full_name||session.user.email)}</b><p class="muted">${escapeHtml(session.user.email)} · ${escapeHtml(profile?.account_type||"customer")}</p><button class="secondary-btn" id="logoutBtn">Logout</button>`;
  $("#logoutBtn").addEventListener("click",signOut);
  await loadOwnerBusinesses();await loadProducts();
  const isAdmin=session.user.app_metadata?.role==="admin";
  $("#adminSection").classList.toggle("hidden",!isAdmin);if(isAdmin)await loadAdminPanel();
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
    return '<article class="branch-card"><div class="branch-card-head"><div><b>'+escapeHtml(b.branch_name)+'</b><div class="branch-type">'+escapeHtml((b.branch_type||"branch").replaceAll("_"," "))+' · '+(b.is_active?"Active":"Inactive")+'</div></div><button class="secondary-btn" data-edit-branch="'+b.id+'">Edit</button></div><p>'+escapeHtml(address)+'</p><p>'+escapeHtml(contacts)+'</p>'+(b.opening_hours?.text?'<p>'+escapeHtml(b.opening_hours.text)+'</p>':'')+'</article>';
  }).join("");
  panel.innerHTML='<div class="branch-actions"><button class="primary-btn" id="addBranchBtn">＋ Add branch / outlet</button></div>'+(cards||'<p class="muted">No branches added yet.</p>');
  $("#addBranchBtn").addEventListener("click",()=>openBranchForm());
  $("[data-edit-branch]").forEach(btn=>btn.addEventListener("click",()=>openBranchForm((data||[]).find(x=>x.id===btn.dataset.editBranch))));
}
function openBranchForm(branch=null){
  if(!session)return showAuth("login");
  $("#branchForm").reset();
  $("#branchId").value=branch?.id||"";
  $("#branchDialogTitle").textContent=branch?"Edit branch / outlet":"Add branch / outlet";
  $("#branchBusiness").innerHTML=ownerBusinesses.map(b=>'<option value="'+b.id+'">'+escapeHtml(b.name)+'</option>').join("");
  const fields={branchName:"branch_name",branchType:"branch_type",branchContactPerson:"contact_person",branchPhone:"phone",branchAltPhone:"alternate_phone",branchWhatsapp:"whatsapp",branchEmail:"email",branchAddress1:"address_line1",branchAddress2:"address_line2",branchLandmark:"landmark",branchArea:"area",branchCity:"city",branchDistrict:"district",branchState:"state",branchPincode:"pincode",branchCountry:"country",branchLatitude:"latitude",branchLongitude:"longitude"};
  for(const [id,key] of Object.entries(fields))$("#"+id).value=branch?.[key]??(id==="branchCountry"?"India":"");
  $("#branchBusiness").value=branch?.business_id||ownerBusinesses[0].id;
  $("#branchHours").value=branch?.opening_hours?.text||"";
  $("#branchActive").checked=branch?.is_active??true;
  $("#branchMessage").textContent="";
  openDialog("branchDialog");
}
$("#branchForm").addEventListener("submit",async e=>{
  e.preventDefault();if(!session)return showAuth("login");
  const num=id=>$("#"+id).value.trim()===""?null:Number($("#"+id).value);
  const payload={business_id:$("#branchBusiness").value,branch_name:$("#branchName").value.trim(),branch_type:$("#branchType").value,contact_person:$("#branchContactPerson").value.trim()||null,phone:$("#branchPhone").value.trim()||null,alternate_phone:$("#branchAltPhone").value.trim()||null,whatsapp:$("#branchWhatsapp").value.trim()||null,email:$("#branchEmail").value.trim()||null,address_line1:$("#branchAddress1").value.trim(),address_line2:$("#branchAddress2").value.trim()||null,landmark:$("#branchLandmark").value.trim()||null,area:$("#branchArea").value.trim()||null,city:$("#branchCity").value.trim(),district:$("#branchDistrict").value.trim()||null,state:$("#branchState").value.trim(),pincode:$("#branchPincode").value.trim()||null,country:$("#branchCountry").value.trim()||"India",latitude:num("branchLatitude"),longitude:num("branchLongitude"),opening_hours:$("#branchHours").value.trim()?{text:$("#branchHours").value.trim()}: {},is_active:$("#branchActive").checked};
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
    const payload={owner_id:session.user.id,category_id:$("#bizCategory").value,name,slug:slugify(name),business_type:$("#bizType").value,phone:$("#bizPhone").value.trim()||null,city:$("#bizCity").value.trim()||null,description:$("#bizDescription").value.trim()||null,address:$("#bizAddress")?.value.trim()||null,address_line2:$("#bizAddress2")?.value.trim()||null,landmark:$("#bizLandmark")?.value.trim()||null,district:$("#bizDistrict")?.value.trim()||null,state:$("#bizState")?.value.trim()||"Maharashtra",pincode:$("#bizPincode")?.value.trim()||null,country:"India",latitude:$("#bizLatitude")?.value?Number($("#bizLatitude").value):null,longitude:$("#bizLongitude")?.value?Number($("#bizLongitude").value):null,image_urls:urls,logo_url:logo,cover_url:cover,listing_status:"pending",verification_status:"pending"};
    const {error}=await supabase.from("businesses").insert(payload);if(error)throw error;
    $("#businessMessage").textContent="Business submitted for review. It will appear publicly after approval.";
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
    btn.disabled=true;const {error}=await supabase.rpc("admin_set_business_status",{p_business_id:btn.dataset.approve,p_listing_status:"published",p_verification_status:"pending"});
    if(error)toast(error.message);else{toast("Business published.");await loadAdminPanel();await loadBusinesses()}
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
    const {error}=await supabase.from("business_verification_requests").update({status,reviewed_by:session.user.id,reviewed_at:new Date().toISOString(),review_notes:status==="rejected"?"Please contact ABN support for details.":null}).eq("id",id);
    if(error){toast(error.message);return}
    if(status==="approved"){
      const req=(requests||[]).find(x=>x.id===id);
      if(req)await supabase.from("businesses").update({verification_status:"verified"}).eq("id",req.business_id);
    }
    toast("Verification "+status+".");await loadAdminPanel();await loadBusinesses();
  }
  $$("[data-verify-approve]").forEach(btn=>btn.addEventListener("click",()=>reviewVerification(btn.dataset.verifyApprove,"approved")));
  $$("[data-verify-reject]").forEach(btn=>btn.addEventListener("click",()=>reviewVerification(btn.dataset.verifyReject,"rejected")));

}
init().catch(err=>toast(err.message||"Unable to initialize ABN."));
