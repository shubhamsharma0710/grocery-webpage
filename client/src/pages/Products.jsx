import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { useAppContext } from "../context/appContext";

const Products = () => {
  const { products, searchQuery } = useAppContext();
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    console.log("🔍 All Products from context:", products);
    console.log("🔎 Current Search Query:", searchQuery);

    // Filter based on search query
    const result =
      searchQuery.length > 0
        ? products.filter((product) =>
            product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : products;

    setFilteredProducts(result);
  }, [products, searchQuery]);

  const inStockProducts = filteredProducts.filter(
    (product) => product?.inStock === true
  );

  return (
    <div className="mt-16">
      <h1 className="text-3xl lg:text-4xl font-medium">All Products</h1>

      {inStockProducts.length === 0 ? (
        <p className="text-red-500 mt-6">No products available.</p>
      ) : (
        <div className="my-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {inStockProducts.map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
