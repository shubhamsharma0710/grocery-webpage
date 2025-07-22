import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { dummyProducts } from "../assets/assets.js";

const backendURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendURL;
axios.defaults.withCredentials = true;

// Set token from localStorage initially
const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Dynamically update axios header on user login
  useEffect(() => {
    if (user?.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;
    }
  }, [user]);

  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/is-auth");
      setIsSeller(data.success);
    } catch {
      setIsSeller(false);
    }
  };

  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth");
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cart || {});
      } else {
        setUser(null);
        toast.error(data.message);
      }
    } catch (error) {
      setUser(null);
      toast.error("User fetch error");
    }
  };

  const fetchProducts = async () => {
  try {
    const { data } = await axios.get("/api/product/list");
    console.log("📦 API product response:", data);

    if (data.success && data.products?.length > 0) {
      setProducts(data.products);
    } else {
      toast("Using dummy products (no products found)");
      console.log("🧪 Setting dummy products:", dummyProducts);
      setProducts(dummyProducts);
    }
  } catch (error) {
    toast.error("Failed to fetch products. Using dummy data.");
    console.log("🧪 API failed, using dummy:", dummyProducts);
    setProducts(dummyProducts);
  }
};


  const addToCart = (itemId) => {
    const updatedCart = { ...cartItems, [itemId]: (cartItems[itemId] || 0) + 1 };
    setCartItems(updatedCart);
    toast.success("Added to cart");
  };

  const updateCartItem = (itemId, quantity) => {
    const updatedCart = { ...cartItems, [itemId]: quantity };
    setCartItems(updatedCart);
    toast.success("Cart updated");
  };

  const removeFromCart = (itemId) => {
    const updatedCart = { ...cartItems };
    if (updatedCart[itemId]) {
      updatedCart[itemId]--;
      if (updatedCart[itemId] <= 0) delete updatedCart[itemId];
      setCartItems(updatedCart);
      toast.success("Removed from cart");
    }
  };

  const cartCount = () => {
    return Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);
  };

  const totalCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [id, qty]) => {
      const product = products.find((p) => p._id === id);
      if (!product) return total;
      const price = product.offerPrice || product.price || 0;
      return total + price * qty;
    }, 0);
  };

  useEffect(() => {
    fetchSeller();
    fetchUser();
    fetchProducts();
  }, []);

  useEffect(() => {
    const syncCart = async () => {
      try {
        const { data } = await axios.post("/api/cart/update", { cartItems });
        if (!data.success) toast.error(data.message);
      } catch (err) {
        toast.error("Cart sync failed");
      }
    };

    if (user) syncCart();
  }, [cartItems]);

  return (
    <AppContext.Provider
      value={{
        navigate,
        user,
        setUser,
        isSeller,
        setIsSeller,
        showUserLogin,
        setShowUserLogin,
        products,
        fetchProducts,
        cartItems,
        setCartItems,
        addToCart,
        updateCartItem,
        removeFromCart,
        searchQuery,
        setSearchQuery,
        cartCount,
        totalCartAmount,
        axios,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
