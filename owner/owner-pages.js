(() => {
  const params = new URLSearchParams(location.search);
  const page = params.get("page") || "dashboard";
  const groups = {
    dashboard: [".hero", "#categoryStrip", ".category-area", "#businesses", "#businessGrid"],
    businesses: ["#businesses", "#businessGrid"],
    products: ["#products", "#productGrid"],
    enquiries: ["#enquiries", "#enquiryPanel"],
    listings: ["#my-listings", "#ownerPanel", "#branches", "#branchPanel"],
    verification: ["#verification", ".verify-panel"],
    profile: ["#profile", "#profilePanel"]
  };
  const activePage = groups[page] ? page : "dashboard";
  const selected = groups[activePage];
  const main = document.querySelector("main#home");
  if (!main) return;
  main.querySelectorAll(".hero, .content-grid .primary-content > *, .content-grid .right-rail").forEach(el => { el.hidden = true; });
  selected.forEach(selector => main.querySelectorAll(selector).forEach(el => { el.hidden = false; }));
  if (page === "dashboard") {
    const rail = main.querySelector(".right-rail");
    if (rail) rail.hidden = false;
  }
  document.querySelectorAll(".sidebar .nav-link").forEach(link => {
    const target = new URL(link.href, location.href).searchParams.get("page") || "dashboard";
    link.classList.toggle("active", target === activePage);
    if (target === activePage) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
  });
  const titles = {dashboard:"Business Owner Dashboard",businesses:"My Business Network",products:"Products & Services",enquiries:"Customer Enquiries",listings:"My Listings & Branches",verification:"Business Verification",profile:"My Profile"};
  const heading = main.querySelector(".hero h1");
  if (heading) heading.textContent = titles[page] || titles.dashboard;
  document.title = (titles[page] || titles.dashboard) + " | ABN";
})();
