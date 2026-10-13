import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg, money } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Home() {
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null); // {type, text}

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  // debounced search + category filter
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api.get('/foods', { params: { q, categoryId: categoryId ?? undefined } })
        .then((r) => setFoods(r.data))
        .catch((e) => setMsg({ type: 'danger', text: errMsg(e) }))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q, categoryId]);

  const addToCart = async (f) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await add(f.id || f._id, 1);
      setMsg({ type: 'success', text: `${f.name} added to cart` });
    } catch (e) {
      setMsg({ type: 'danger', text: errMsg(e) });
    }
    setTimeout(() => setMsg(null), 2000);
  };

  return (
    <>
      <section className="hero">
        <p className="eyebrow">fresh · warm · delivered slow</p>
        <h1>What are we <em>craving</em> today?</h1>
        <p className="hero-sub">Pick a mood, fill your basket, and we'll bring the cozy.</p>
      </section>
      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <input className="form-control search-input" placeholder="Search dishes, cravings, vibes…" value={q}
                 onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="mb-4 d-flex flex-wrap gap-2">
        <span className={`cat-pill ${categoryId === null ? 'active' : ''}`}
              onClick={() => setCategoryId(null)}>All</span>
        {categories.map((c) => {
          const cid = c.id || c._id;
          return (
            <span key={cid}
                  className={`cat-pill ${categoryId === cid ? 'active' : ''}`}
                  onClick={() => setCategoryId(cid)}>{c.name}</span>
          );
        })}
      </div>

      {msg && <div className={`alert alert-${msg.type} py-2`}>{msg.text}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading food items...</span>
          </div>
          <p className="text-muted mt-2">Loading delicious dishes...</p>
        </div>
      ) : (
        <div className="row g-4">
          {foods.map((f) => {
            const fid = f.id || f._id;
            return (
              <div className="col-sm-6 col-lg-4" key={fid}>
                <div className="card food-card h-100">
                  {f.imageUrl
                    ? <img src={f.imageUrl} className="card-img-top food-img" alt={f.name}
                           onError={(e) => { e.target.style.display = 'none'; }} />
                    : <div className="food-ph">🍽️</div>}
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between">
                      <h5 className="card-title">{f.name}</h5>
                      <span className="fw-bold">{money(f.price)}</span>
                    </div>
                    <span className="badge bg-light text-dark align-self-start mb-2">{f.category?.name}</span>
                    <p className="card-text text-muted small flex-grow-1">{f.description}</p>
                    {f.available
                      ? <button className="btn btn-brand" onClick={() => addToCart(f)}>Add to cart</button>
                      : <button className="btn btn-outline-secondary" disabled>Unavailable</button>}
                  </div>
                </div>
              </div>
            );
          })}
          {foods.length === 0 && (
            <div className="col-12 text-center py-5">
              <p className="text-muted fs-5">No dishes found matching your selection.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
