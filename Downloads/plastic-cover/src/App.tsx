import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowRight, BadgeCheck, Droplets, Filter, LayoutDashboard, LogIn, Menu, MessageCircle, Package, Pencil, Plus, Search, ShieldCheck, ShoppingBag, Trash2, Truck, X } from 'lucide-react'
import { categories, type Product } from './types'

const waNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || '918105628853').replace(/\D/g, '')
const demoProducts: Product[] = [
  { id:'demo-1', name:'Transparent Packing Roll', description:'Clear flexible plastic packing roll for general wrapping and packaging. Confirm exact gauge and roll size before ordering.', price:250, category:'Transparent Packing Rolls', stock:20, imageUrl:'https://placehold.co/900x700/f1f5f6/29485a?text=Transparent+Packing+Roll', featured:true, active:true, material:'LDPE', size:'Customisable', length:'As per roll', width:'As per roll', thickness:'As per requirement', weight:'As per roll', colour:'Transparent', packingType:'Roll' },
  { id:'demo-2', name:'Clear Plastic Packing Sheet', description:'Transparent plastic sheet for covering, wrapping and protecting goods. Size and thickness can be confirmed on WhatsApp.', price:180, category:'Plastic Packing Sheets', stock:15, imageUrl:'https://placehold.co/900x700/f1f5f6/29485a?text=Clear+Plastic+Sheet', featured:true, active:true, material:'LDPE', size:'Customisable', length:'As required', width:'As required', thickness:'As required', weight:'As required', colour:'Transparent', packingType:'Sheet' },
  { id:'demo-3', name:'Transparent Plastic Cover', description:'General-purpose clear plastic cover for packing and protection. Contact us for available dimensions.', price:120, category:'LDPE Plastic Covers', stock:25, imageUrl:'https://placehold.co/900x700/f1f5f6/29485a?text=Plastic+Cover', featured:true, active:true, material:'LDPE', size:'Multiple sizes', length:'As required', width:'As required', thickness:'As required', weight:'As required', colour:'Transparent', packingType:'Cover' },
]
const money = (n:number) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n)
const whatsapp = (p:Product) => {
  const msg = `Hello! I am interested in this product.\n\nProduct: ${p.name}\nPrice: ${money(p.price)}\nMaterial: ${p.material || 'Please confirm'}\nSize: ${p.size || 'Please confirm'}\nLength: ${p.length || 'Please confirm'}\nWidth: ${p.width || 'Please confirm'}\nThickness: ${p.thickness || 'Please confirm'}\nWeight: ${p.weight || 'Please confirm'}\n\nPlease share availability, quantity and delivery details.`
  window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`,'_blank','noopener,noreferrer')
}
function App() {
  const [products,setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('plastic-cover-products')
      return saved ? JSON.parse(saved) as Product[] : demoProducts
    } catch { return demoProducts }
  })
  const [isAdmin,setIsAdmin] = useState(() => sessionStorage.getItem('plastic-cover-admin') === 'true')
  const [view,setView] = useState<'home'|'products'|'admin'|'login'>('home')
  const [activeProduct,setActiveProduct] = useState<Product|null>(null)
  const [search,setSearch] = useState('')
  const [category,setCategory] = useState('All')
  const [sort,setSort] = useState('featured')
  const [mobileMenu,setMobileMenu] = useState(false)
  const [notice,setNotice] = useState('')
  const [loading,setLoading] = useState(false)
  const [editing,setEditing] = useState<Product|null>(null)
  const emptyForm = {name:'',description:'',price:'',category:categories[0],stock:'0',featured:false,active:true,material:'',size:'',length:'',width:'',thickness:'',weight:'',colour:'Transparent',packingType:''}
  const [form,setForm] = useState(emptyForm)
  const [imageFile,setImageFile] = useState<File|null>(null)
  const [loginEmail,setLoginEmail] = useState('Abcd')
  const [loginPassword,setLoginPassword] = useState('')

  useEffect(() => {
    try { localStorage.setItem('plastic-cover-products', JSON.stringify(products)) }
    catch { setNotice('Browser storage is full. Try a smaller product image.') }
  },[products])
  const visible = useMemo(() => {
    let rows = products.filter(p => p.active && p.stock > 0)
    if (category !== 'All') rows = rows.filter(p => p.category === category)
    if (search.trim()) rows = rows.filter(p => `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'low') rows.sort((a,b)=>a.price-b.price)
    if (sort === 'high') rows.sort((a,b)=>b.price-a.price)
    if (sort === 'name') rows.sort((a,b)=>a.name.localeCompare(b.name))
    if (sort === 'featured') rows.sort((a,b)=>Number(b.featured)-Number(a.featured))
    return rows
  },[products,category,search,sort])
  const featured = products.filter(p=>p.active && p.stock>0 && p.featured).slice(0,4)

  const openForm = (p?:Product) => {
    setEditing(p || null)
    setForm(p ? {name:p.name,description:p.description,price:String(p.price),category:p.category,stock:String(p.stock),featured:p.featured,active:p.active,material:p.material||'',size:p.size||'',length:p.length||'',width:p.width||'',thickness:p.thickness||'',weight:p.weight||'',colour:p.colour||'Transparent',packingType:p.packingType||''} : {...emptyForm})
    setImageFile(null)
    setView('admin')
  }
  const saveProduct = async (e:FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || Number(form.price)<=0 || Number(form.stock)<0) { setNotice('Enter a product name, a valid price, and a stock quantity.'); return }
    setLoading(true)
    try {
      let imageUrl = editing?.imageUrl || ''
      if (imageFile) {
        if (!imageFile.type.startsWith('image/')) throw new Error('Please select an image file.')
        imageUrl = await new Promise<string>((resolve,reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result))
          reader.onerror = () => reject(new Error('Could not read the selected image.'))
          reader.readAsDataURL(imageFile)
        })
      }
      const data = {...form,name:form.name.trim(),price:Number(form.price),stock:Number(form.stock),imageUrl}
      if (editing) setProducts(prev => prev.map(p => p.id === editing.id ? {...data,id:editing.id} as Product : p))
      else setProducts(prev => [...prev,{...data,id:`product-${Date.now()}`} as Product])
      setNotice(editing ? 'Product updated successfully.' : 'Product added successfully.')
      setEditing(null); setImageFile(null)
    } catch(err) { setNotice(err instanceof Error ? err.message : 'Could not save product.') }
    finally { setLoading(false) }
  }
  const removeProduct = async (p:Product) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return
    setProducts(prev => prev.filter(item => item.id !== p.id))
    setNotice('Product deleted.')
  }
  const login = async (e:FormEvent) => {
    e.preventDefault()
    if (loginEmail.trim().toLowerCase() === 'abcd' && loginPassword === 'Abcd') {
      sessionStorage.setItem('plastic-cover-admin','true')
      setIsAdmin(true)
      setView('admin')
      setNotice('Welcome to your admin dashboard.')
    } else setNotice('Incorrect username or password.')
  }
  const nav = (v:'home'|'products'|'admin'|'login') => { setView(v);setActiveProduct(null);setMobileMenu(false);window.scrollTo({top:0,behavior:'smooth'}) }
  const ProductCard = ({p}:{p:Product}) => <article className="product-card">
    <button className="product-image" onClick={()=>setActiveProduct(p)} aria-label={`View ${p.name}`}><img src={p.imageUrl || 'https://placehold.co/600x500?text=Plastic+Cover'} alt={p.name}/>{p.featured && <span className="tag">Popular</span>}</button>
    <div className="product-info"><div className="eyebrow">{p.category}</div><h3>{p.name}</h3><div className="price-row"><strong>{money(p.price)}</strong><span className="stock">{p.stock>0?'In stock':'Out of stock'}</span></div><div className="card-actions"><button className="btn btn-light" onClick={()=>setActiveProduct(p)}>Details</button><button className="btn btn-green" onClick={()=>whatsapp(p)}><MessageCircle size={16}/> Buy Now</button></div></div>
  </article>

  return <div className="app-shell">
    <div className="top-strip"><span>Transparent packing materials for everyday business</span><span>Need help? Chat with us on WhatsApp</span></div>
    <header className="site-header"><div className="header-inner">
      <button className="brand" onClick={()=>nav('home')}><span className="brand-mark"><img src="/package-logo.svg" alt="Plastic Cover logo"/></span><span>PLASTIC <b>COVER</b><small>TRANSPARENT PACKING MATERIAL</small></span></button>
      <button className="mobile-toggle" onClick={()=>setMobileMenu(!mobileMenu)} aria-label="Toggle navigation">{mobileMenu?<X/>:<Menu/>}</button>
      <nav className={mobileMenu?'nav open':'nav'}><button className={view==='home'?'active':''} onClick={()=>nav('home')}>Home</button><button className={view==='products'?'active':''} onClick={()=>nav('products')}>All Products</button><a href="#categories" onClick={()=>setMobileMenu(false)}>Categories</a><a href="#about" onClick={()=>setMobileMenu(false)}>About</a><a href="#contact" onClick={()=>setMobileMenu(false)}>Contact</a></nav>
      <div className="header-actions"><button className="btn btn-outline" onClick={()=>nav(isAdmin?'admin':'login')}><LogIn size={16}/>{isAdmin?'Admin dashboard':'Admin login'}</button><button className="btn btn-green" onClick={()=>window.open(`https://wa.me/${waNumber}`,'_blank','noopener,noreferrer')}><MessageCircle size={16}/> WhatsApp</button></div>
    </div></header>

    {notice && <div className="notice" role="status">{notice}<button onClick={()=>setNotice('')} aria-label="Dismiss"><X size={15}/></button></div>}

    {view==='home' && !activeProduct && <>
      <section className="hero"><div className="hero-copy"><div className="hero-kicker"><span/> TRANSPARENT PACKING MATERIAL</div><h1>Transparent packing, <em>made simple.</em></h1><p>Browse clear plastic rolls, sheets and covers. View product specifications and contact us directly to confirm sizes, thickness and prices.</p><div className="hero-actions"><button className="btn btn-primary btn-large" onClick={()=>nav('products')}>Explore products <ArrowRight size={17}/></button><button className="btn btn-white btn-large" onClick={()=>window.open(`https://wa.me/${waNumber}`,'_blank','noopener,noreferrer')}><MessageCircle size={17}/> Talk to us</button></div><div className="hero-trust"><span><BadgeCheck size={17}/> Practical products</span><span><ShieldCheck size={17}/> Friendly support</span></div></div><div className="hero-visual"><div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/><div className="hero-product"><img src="https://placehold.co/900x900/f1f5f6/29485a?text=Transparent+Packing+Film" alt="Modern tap and bathroom fixture"/></div><div className="floating-note"><span className="note-icon"><Droplets size={19}/></span><span><b>Made for everyday use</b><small>Plastic packing materials</small></span></div></div></section>
      <section className="benefits"><div><Package/><span><b>Useful essentials</b><small>For everyday plumbing</small></span></div><div><BadgeCheck/><span><b>Value-focused range</b><small>Options for every home</small></span></div><div><MessageCircle/><span><b>Direct assistance</b><small>Talk to us on WhatsApp</small></span></div><div><Truck/><span><b>Order enquiries</b><small>Confirm delivery with us</small></span></div></section>
      <section className="section" id="categories"><div className="section-heading"><div><div className="eyebrow">SHOP BY NEED</div><h2>Shop packing materials by type</h2><p>Explore rolls, sheets, covers and custom-size packaging material.</p></div><button className="text-link" onClick={()=>nav('products')}>View all products <ArrowRight size={16}/></button></div><div className="category-grid">{categories.slice(0,6).map((c,i)=><button className="category-tile" key={c} onClick={()=>{setCategory(c);nav('products')}}><span className="category-icon">{[<Droplets/>,<Package/>,<ShoppingBag/>,<Droplets/>,<Truck/>,<Filter/>][i]}</span><b>{c}</b><small>Explore range <ArrowRight size={13}/></small></button>)}</div></section>
      <section className="section featured-section"><div className="section-heading"><div><div className="eyebrow">CUSTOMER FAVOURITES</div><h2>Featured products</h2><p>Transparent plastic packaging products available from our catalogue.</p></div><button className="text-link" onClick={()=>nav('products')}>Shop all <ArrowRight size={16}/></button></div><div className="product-grid">{featured.length?featured.map(p=><ProductCard key={p.id} p={p}/>):<p className="empty">Products added by the admin will appear here.</p>}</div></section>
      <section className="about-band" id="about"><div className="about-symbol"><Droplets size={38}/></div><div><div className="eyebrow">ABOUT PLASTIC COVER</div><h2>Transparent packing material. Direct support.</h2><p>Browse transparent plastic packing rolls, sheets and covers. Product dimensions and prices are managed by our store admin. Message us on WhatsApp to confirm your requirements and delivery.</p></div><button className="btn btn-white" onClick={()=>window.open(`https://wa.me/${waNumber}`,'_blank','noopener,noreferrer')}>Contact our team <ArrowRight size={16}/></button></section>
    </>}

    {view==='products' && !activeProduct && <main className="section listing-page"><div className="section-heading"><div><div className="eyebrow">OUR CATALOGUE</div><h2>All products</h2><p>Find transparent packing rolls, sheets and plastic covers.</p></div><span className="result-count">{visible.length} products</span></div><div className="filters"><label className="search-box"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search rolls, sheets, covers, sizes..."/></label><select value={category} onChange={e=>setCategory(e.target.value)}><option>All</option>{categories.map(c=><option key={c}>{c}</option>)}</select><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Sort: Featured</option><option value="low">Price: Low to high</option><option value="high">Price: High to low</option><option value="name">Name: A to Z</option></select></div><div className="product-grid">{visible.map(p=><ProductCard key={p.id} p={p}/>)}</div>{!visible.length&&<div className="empty-state"><Package size={36}/><h3>No products found</h3><p>Try another search or category.</p><button className="btn btn-primary" onClick={()=>{setSearch('');setCategory('All')}}>Clear filters</button></div>}</main>}

    {activeProduct && <main className="section detail-page"><button className="back-link" onClick={()=>setActiveProduct(null)}>← Back to products</button><div className="detail-layout"><div className="detail-image"><img src={activeProduct.imageUrl || 'https://placehold.co/800x700?text=Plastic+Cover'} alt={activeProduct.name}/></div><div className="detail-copy"><div className="eyebrow">{activeProduct.category}</div><h1>{activeProduct.name}</h1><div className="detail-price">{money(activeProduct.price)}</div><span className="availability"><i/> {activeProduct.stock>0?`Available · ${activeProduct.stock} in stock`:'Currently out of stock'}</span><p>{activeProduct.description}</p><div className="specification-box"><h3>Product specifications</h3><dl>{([['Material',activeProduct.material],['Size',activeProduct.size],['Length',activeProduct.length],['Width',activeProduct.width],['Thickness',activeProduct.thickness],['Weight',activeProduct.weight],['Colour',activeProduct.colour],['Packing type',activeProduct.packingType]] as [string,string|undefined][]).filter(([,v])=>v).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div><div className="detail-points"><span><BadgeCheck/> Product specifications available</span><span><MessageCircle/> Direct seller assistance</span></div><button disabled={activeProduct.stock<=0} className="btn btn-green btn-large full" onClick={()=>whatsapp(activeProduct)}><MessageCircle/> Buy Now on WhatsApp</button><small className="detail-help">You can confirm final availability, quantity and delivery with the seller in WhatsApp.</small></div></div></main>}

    {view==='login' && !isAdmin && <main className="auth-wrap"><form className="auth-card" onSubmit={login}><div className="auth-icon"><img src="/package-logo.svg" alt="Plastic Cover logo"/></div><div className="eyebrow">SECURE ACCESS</div><h2>Admin login</h2><p>Sign in to manage your Plastic Cover product catalogue.</p><label>Username<input type="text" required value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder="Enter admin username" autoComplete="username"/></label><label>Password<input type="password" required value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} placeholder="Enter admin password" autoComplete="current-password"/></label><button className="btn btn-primary full" type="submit">Sign in <ArrowRight size={16}/></button><div className="setup-warning">Admin access is available on this device. Product changes are saved in this browser.</div></form></main>}

    {view==='admin' && isAdmin && <main className="admin-layout"><aside className="admin-sidebar"><div className="admin-brand"><LayoutDashboard/> Admin workspace</div><button className="side-active"><LayoutDashboard size={17}/> Overview & products</button><button onClick={()=>openForm()}><Plus size={17}/> Add product</button><button onClick={()=>{sessionStorage.removeItem('plastic-cover-admin');setIsAdmin(false);nav('home')}}><LogIn size={17}/> Sign out</button></aside><div className="admin-main"><div className="admin-heading"><div><div className="eyebrow">STORE MANAGEMENT</div><h1>Product dashboard</h1><p>Manage the products displayed in your storefront.</p></div><button className="btn btn-primary" onClick={()=>openForm()}><Plus size={17}/> Add product</button></div><div className="stats-grid"><div><span>Total products</span><b>{products.length}</b></div><div><span>Available</span><b>{products.filter(p=>p.active&&p.stock>0).length}</b></div><div><span>Out of stock</span><b>{products.filter(p=>p.stock<=0).length}</b></div><div><span>Categories</span><b>{new Set(products.map(p=>p.category)).size}</b></div></div>{editing!==null || notice==='__form__' ? null : null}<div className="admin-table-wrap"><div className="table-title"><h3>Manage products</h3><span>{products.length} listed</span></div><table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td><div className="table-product"><img src={p.imageUrl} alt=""/><b>{p.name}</b></div></td><td>{p.category}</td><td>{money(p.price)}</td><td>{p.stock}</td><td><span className={p.active&&p.stock>0?'status-live':'status-off'}>{p.active&&p.stock>0?'Available':'Unavailable'}</span></td><td><div className="table-actions"><button onClick={()=>openForm(p)} aria-label="Edit product"><Pencil size={16}/></button><button onClick={()=>removeProduct(p)} aria-label="Delete product"><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div>
      <form className="product-form" onSubmit={saveProduct}><div className="form-heading"><div><div className="eyebrow">{editing?'UPDATE LISTING':'NEW LISTING'}</div><h3>{editing?'Edit product':'Add a product'}</h3></div>{editing&&<button type="button" className="text-link" onClick={()=>setEditing(null)}>Cancel edit <X size={14}/></button>}</div><div className="form-grid"><label>Product name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Transparent packing roll"/></label><label>Price (₹)<input required type="number" min="1" step="1" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="150"/></label><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>Stock quantity<input required type="number" min="0" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/></label><label className="span-two">Description<textarea rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe the plastic packing material..."/></label><label>Material<input value={form.material} onChange={e=>setForm({...form,material:e.target.value})} placeholder="e.g. LDPE / PP"/></label><label>Product size<input value={form.size} onChange={e=>setForm({...form,size:e.target.value})} placeholder="e.g. 12 x 18 inch"/></label><label>Length<input value={form.length} onChange={e=>setForm({...form,length:e.target.value})} placeholder="e.g. 100 metres"/></label><label>Width<input value={form.width} onChange={e=>setForm({...form,width:e.target.value})} placeholder="e.g. 3 feet"/></label><label>Thickness / Gauge<input value={form.thickness} onChange={e=>setForm({...form,thickness:e.target.value})} placeholder="e.g. 50 micron"/></label><label>Weight<input value={form.weight} onChange={e=>setForm({...form,weight:e.target.value})} placeholder="e.g. 1 kg"/></label><label>Colour<input value={form.colour} onChange={e=>setForm({...form,colour:e.target.value})} placeholder="Transparent"/></label><label>Packing type<input value={form.packingType} onChange={e=>setForm({...form,packingType:e.target.value})} placeholder="Roll / Sheet / Bag"/></label><label className="span-two">Product image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setImageFile(e.target.files?.[0]||null)}/><small>JPG, PNG or WebP. Uploads to Firebase Storage.</small></label><label className="check-label"><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/> Featured product</label><label className="check-label"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/> Visible in store</label></div><button className="btn btn-primary" type="submit" disabled={loading}>{loading?'Saving...':editing?'Update product':'Save product'} <ArrowRight size={16}/></button></form>
      <div className="setup-warning">Products and images are saved only in this browser on this device. Export or back up your catalogue before clearing browser data.</div></div></main>}

    <footer className="footer" id="contact"><div className="footer-main"><div className="brand footer-brand"><span className="brand-mark"><img src="/package-logo.svg" alt="Plastic Cover logo"/></span><span>PLASTIC <b>COVER</b><small>TRANSPARENT PACKING MATERIAL</small></span></div><p>Transparent plastic packing rolls, sheets and covers. Enquire directly on WhatsApp.</p><button className="btn btn-green" onClick={()=>window.open(`https://wa.me/${waNumber}`,'_blank','noopener,noreferrer')}><MessageCircle size={16}/> Chat on WhatsApp</button></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Plastic Cover. All rights reserved.</span><span>Browse · Enquire · Order directly</span></div></footer>
    <button className="floating-whatsapp" onClick={()=>window.open(`https://wa.me/${waNumber}`,'_blank','noopener,noreferrer')} aria-label="Chat on WhatsApp"><MessageCircle/></button>
  </div>
}
export default App